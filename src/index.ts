/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */

import { spawn, exec, spawnSync, execSync, ChildProcess, ExecException } from 'child_process'
import { Options, Script, Tasks, Task } from './types'
import * as webpack from 'webpack'
import { Readable } from 'stream'

const defaultTask: Tasks = {
  scripts: [],
  blocking: false,
  parallel: false
}

export default class WebpackShellPlugin {
  private onBeforeNormalRun: Tasks
  private onBeforeBuild: Tasks
  private onBuildStart: Tasks
  private onBuildEnd: Tasks
  private onBuildExit: Tasks
  private onBuildError: Tasks
  private onWatchRun: Tasks
  private onDoneWatch: Tasks
  private onAfterDone: Tasks
  private onFailedBuild: Tasks
  private onBeforeCompile: Tasks
  private env: any = {}
  private dev = true
  private shell = true
  private safe = false
  private logging = true
  private swallowError = false

  private validateEvent (tasks: Tasks | string | Function | undefined | null): Tasks {
    if (!tasks) {
      return JSON.parse(JSON.stringify(defaultTask))
    }
    if (typeof tasks === 'string') {
      return { scripts: tasks.split('&&'), blocking: false, parallel: false }
    } else if (typeof tasks === 'function') {
      return { scripts: [tasks], blocking: false, parallel: false }
    }

    return tasks
  }

  constructor (options: Options) {
    if (options.verbose) {
      this.warn(`WebpackShellPluginNext [${new Date()}]: Verbose is being deprecated, please remove.`)
    }

    this.onBeforeBuild = this.validateEvent(options.onBeforeBuild)
    this.onBeforeNormalRun = this.validateEvent(options.onBeforeNormalRun)
    this.onBuildStart = this.validateEvent(options.onBuildStart)
    this.onBuildEnd = this.validateEvent(options.onBuildEnd)
    this.onBuildExit = this.validateEvent(options.onBuildExit)
    this.onBuildError = this.validateEvent(options.onBuildError)
    this.onWatchRun = this.validateEvent(options.onWatchRun)
    this.onDoneWatch = this.validateEvent(options.onDoneWatch)
    this.onAfterDone = this.validateEvent(options.onAfterDone)
    this.onFailedBuild = this.validateEvent(options.onFailedBuild)
    this.onBeforeCompile = this.validateEvent(options.onBeforeCompile)

    if (options.env !== undefined) {
      this.env = options.env
    }
    if (options.dev !== undefined) {
      this.dev = options.dev
    }
    if (options.safe !== undefined) {
      this.safe = options.safe
    }
    if (options.shell !== undefined) {
      this.shell = options.shell
    }
    if (options.logging !== undefined) {
      this.logging = options.logging
    }
    if (options.swallowError !== undefined) {
      this.swallowError = options.swallowError
    }

    this.onCompilation = this.onCompilation.bind(this)
    this.onBeforeRun = this.onBeforeRun.bind(this)
    this.onBeforeCompileRun = this.onBeforeCompileRun.bind(this)
    this.onAfterEmit = this.onAfterEmit.bind(this)
    this.onDone = this.onDone.bind(this)
    this.afterDone = this.afterDone.bind(this)
    this.onFailed = this.onFailed.bind(this)
    this.putsAsync = this.putsAsync.bind(this)
    this.puts = this.puts.bind(this)
  }

  private putsAsync (resolve: (val: any) => void) {
    return (error: ExecException | null, _stdout: string, _stderr: string) => {
      if (error && !this.swallowError) {
        throw error
      }
      resolve(error)
    }
  }

  private puts (error: Error, _stdout: Readable, _stderr: Readable) {
    if (error && !this.swallowError) {
      throw error
    }
  }

  private spreadStdoutAndStdErr (proc: ChildProcess) {
    if (!proc.stdout || !proc.stderr) return
    proc.stdout.pipe(process.stdout)
    proc.stderr.pipe(process.stdout)
  }

  private serializeScript (script: string | Script): Script {
    if (typeof script === 'string') {
      const [command, ...args] = script.split(' ')
      return { command, args }
    }
    const { command, args } = script
    return { command, args }
  }

  private handleScript (script: string) {
    if (this.safe) {
      return execSync(script, { maxBuffer: Number.MAX_SAFE_INTEGER, stdio: this.logging ? [0, 1, 2] : undefined })
    }

    const { command, args } = this.serializeScript(script)
    let env = Object.create(global.process.env)
    env = Object.assign(env, this.env)
    const result = spawnSync(command, args, { stdio: this.logging ? ['inherit', 'inherit', 'pipe'] : undefined, env, shell: this.shell })
    if (result.status !== 0 && !this.swallowError) {
      const errorMessage = `Script failed with exit code ${result.status}: ${command} ${args.join(' ')}`
      if (this.logging) {
        this.error(`stderr error ${command} ${args.join(' ')}: ${result.stderr}`)
      }
      throw new Error(errorMessage)
    }
    if (this.logging && result.status !== 0) {
      this.error(`stderr error ${command} ${args.join(' ')}: ${result.stderr}`)
    }
    return result
  }

  private handleScriptAsync (script: string) {
    if (this.safe) {
      return new Promise((resolve, reject) => {
        this.spreadStdoutAndStdErr(exec(script, (error, stdout, stderr) => {
          if (error && !this.swallowError) {
            reject(error)
          } else {
            resolve(error)
          }
        }))
      })
    }

    const { command, args } = this.serializeScript(script)
    let env = Object.create(global.process.env)
    env = Object.assign(env, this.env)
    const proc = spawn(command, args, { stdio: 'inherit', env: env, shell: this.shell })
    if (this.logging) {
      proc.on('error', (err) => {
        this.error(`stderr error ${command} ${args.join(' ')}: ${err.message}`)
      })
    }
    return new Promise((resolve, reject) => {
      proc.on('close', (code) => {
        if (code !== 0 && !this.swallowError) {
          const errorMessage = `Script failed with exit code ${code}: ${command} ${args.join(' ')}`
          reject(new Error(errorMessage))
        } else {
          resolve(code)
        }
      })
    })
  }

  private async executeScripts (scripts: Task[], parallel = false, blocking = false) {
    if (!scripts || scripts.length <= 0) {
      return
    }

    if (blocking && parallel) {
      throw new Error(`WebpackShellPluginNext [${new Date()}]: Not supported`)
    }

    for (let i = 0; i < scripts.length; i++) {
      const script: Task = scripts[i]
      if (typeof script === 'function') {
        if (blocking) {
          await script()
        } else {
          script()
        }
        continue
      }
      if (blocking) {
        this.handleScript(script)
      } else if (!blocking) {
        if (parallel) {
          this.handleScriptAsync(script).catch((error) => {
            if (!this.swallowError) {
              throw error
            }
          })
        } else {
          await this.handleScriptAsync(script)
        }
      }
    }
  }

  apply (compiler: webpack.Compiler): void {
    compiler.hooks.beforeRun.tapAsync('webpack-shell-plugin-next', this.onBeforeRun)
    compiler.hooks.failed.tap('webpack-shell-plugin-next', this.onFailed)
    compiler.hooks.make.tap('webpack-shell-plugin-next', this.onBefore)
    compiler.hooks.beforeCompile.tapAsync('webpack-shell-plugin-next', this.onBeforeCompileRun)
    compiler.hooks.compilation.tap('webpack-shell-plugin-next', this.onCompilation)
    compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', this.onAfterEmit)
    compiler.hooks.done.tapAsync('webpack-shell-plugin-next', this.onDone)
    compiler.hooks.afterCompile.tapAsync('webpack-shell-plugin-next', this.afterCompile)
    compiler.hooks.afterDone.tap('webpack-shell-plugin-next', this.afterDone)
    compiler.hooks.watchRun.tapAsync('webpack-shell-plugin-next', this.watchRun)
  }

  private readonly onBeforeRun = async (_compiler: webpack.Compiler, callback?: Function): Promise<void> => {
    try {
      const onBeforeNormalRun = this.onBeforeNormalRun
      if (onBeforeNormalRun.scripts && onBeforeNormalRun.scripts.length > 0) {
        this.log('Executing pre-run scripts')
        await this.executeScripts(onBeforeNormalRun.scripts, onBeforeNormalRun.parallel, onBeforeNormalRun.blocking)
        if (this.dev) {
          this.onDoneWatch = JSON.parse(JSON.stringify(defaultTask))
        }
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback(error)
      }
    }
  }

  private readonly afterDone = async (): Promise<void> => {
    const onAfterDone = this.onAfterDone
    if (onAfterDone.scripts && onAfterDone.scripts.length > 0) {
      this.log('Executing additional scripts before exit')
      try {
        await this.executeScripts(onAfterDone.scripts, onAfterDone.parallel, onAfterDone.blocking)
        if (this.dev) {
          this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
        }
      } catch (error) {
        // Для синхронного хука afterDone, используем setTimeout для асинхронного завершения процесса
        setTimeout(() => {
          console.error(`WebpackShellPluginNext: Script failed: ${error.message}`)
          process.exit(1)
        }, 0)
      }
    }
  }

  private readonly afterCompile = async (_compilation: webpack.Compilation, callback?: Function): Promise<void> => {
    try {
      const onDoneWatch = this.onDoneWatch
      if (onDoneWatch.scripts && onDoneWatch.scripts.length > 0) {
        this.log('Executing additional scripts before exit')
        await this.executeScripts(onDoneWatch.scripts, onDoneWatch.parallel, onDoneWatch.blocking)
        if (this.dev) {
          this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
        }
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback(error)
      }
    }
  };

  private readonly onFailed = async (): Promise<void> => {
    const onFailedBuild = this.onFailedBuild
    if (onFailedBuild.scripts && onFailedBuild.scripts.length) {
      this.log('Executing before build scripts')
      await this.executeScripts(onFailedBuild.scripts, onFailedBuild.parallel, onFailedBuild.blocking)
      if (this.dev) {
        this.onBeforeBuild = JSON.parse(JSON.stringify(defaultTask))
      }
    }
  };

  private readonly onBefore = async (_compilation: webpack.Compilation): Promise<void> => {
    const onBeforeBuild = this.onBeforeBuild
    if (onBeforeBuild.scripts && onBeforeBuild.scripts.length) {
      this.log('Executing before build scripts')
      await this.executeScripts(onBeforeBuild.scripts, onBeforeBuild.parallel, onBeforeBuild.blocking)
      if (this.dev) {
        this.onBeforeBuild = JSON.parse(JSON.stringify(defaultTask))
      }
    }
  };

  private readonly onCompilation = async (compilation: webpack.Compilation): Promise<void> => {
    const onBuildStartOption = this.onBuildStart
    if (onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0) {
      this.log('Executing pre-build scripts')
      await this.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking)
      if (this.dev) {
        this.onBuildStart = JSON.parse(JSON.stringify(defaultTask))
      }
    }
  };

  private readonly onBeforeCompileRun = async (_params: any, callback: () => void): Promise<void> => {
    try {
      const onBeforeCompile = this.onBeforeCompile
      if (onBeforeCompile.scripts && onBeforeCompile.scripts.length > 0) {
        this.log('Executing pre-build scripts')
        await this.executeScripts(onBeforeCompile.scripts, onBeforeCompile.parallel, onBeforeCompile.blocking)
        if (this.dev) {
          this.onBuildStart = JSON.parse(JSON.stringify(defaultTask))
        }
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback()
      }
    }
  };

  private readonly onAfterEmit = async (_compilation: webpack.Compilation, callback?: Function): Promise<void> => {
    try {
      const onBuildEndOption = this.onBuildEnd
      if (onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0) {
        this.log('Executing post-build scripts')
        await this.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking)
        if (this.dev) {
          this.onBuildEnd = JSON.parse(JSON.stringify(defaultTask))
        }
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback(error)
      }
    }
  };

  private readonly onDone = async (compilation: webpack.Stats, callback?: Function): Promise<void> => {
    try {
      if (compilation.hasErrors()) {
        const onBuildError = this.onBuildError
        if (onBuildError.scripts && onBuildError.scripts.length > 0) {
          this.warn('Executing error scripts before exit')
          await this.executeScripts(onBuildError.scripts, onBuildError.parallel, onBuildError.blocking)
          if (this.dev) {
            this.onBuildError = JSON.parse(JSON.stringify(defaultTask))
          }
        }
      }
      const onBuildExit = this.onBuildExit
      if (onBuildExit.scripts && onBuildExit.scripts.length > 0) {
        this.log('Executing additional scripts before exit')
        await this.executeScripts(onBuildExit.scripts, onBuildExit.parallel, onBuildExit.blocking)
        if (this.dev) {
          this.onBuildExit = JSON.parse(JSON.stringify(defaultTask))
        }
      }
      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback(error)
      }
    }
  };

  private readonly watchRun = async (_compiler: webpack.Compiler, callback?: Function): Promise<void> => {
    try {
      const onWatchRun = this.onWatchRun
      if (onWatchRun.scripts && onWatchRun.scripts.length) {
        this.log('Executing onWatchRun build scripts')
        await this.executeScripts(onWatchRun.scripts, onWatchRun.parallel, onWatchRun.blocking)
        if (this.dev) {
          this.onWatchRun = JSON.parse(JSON.stringify(defaultTask))
        }
      }

      if (callback) {
        callback()
      }
    } catch (error) {
      if (callback) {
        callback(error)
      }
    }
  };

  private log (text: string) {
    if (this.logging) {
      console.log(text)
    }
  }

  private warn (text: string) {
    if (this.logging) {
      console.warn(text)
    }
  }

  private error (text: string) {
    if (this.logging) {
      console.error(text)
    }
  }
}

module.exports = WebpackShellPlugin
