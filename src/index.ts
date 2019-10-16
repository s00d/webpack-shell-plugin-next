/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */

import { spawn, exec, spawnSync, execSync, ChildProcess } from 'child_process';
import  { Options, Script, Task } from './types';
import * as os from 'os';
import * as webpack from 'webpack';
import { Readable } from 'stream';
// if (!global._babelPolyfill) {
//     require('babel-polyfill');
// }

const defaultTask: Task = {
    scripts: [],
    blocking: false,
    parallel: false
};

const defaultOptions: Options = {
    onBeforeBuild: JSON.parse(JSON.stringify(defaultTask)),
    onBuildStart: JSON.parse(JSON.stringify(defaultTask)),
    onBuildEnd: JSON.parse(JSON.stringify(defaultTask)),
    onBuildExit: JSON.parse(JSON.stringify(defaultTask)),
    onBuildError: JSON.parse(JSON.stringify(defaultTask)),
    env: {},
    dev: true,
    safe: false,
    logging: true,
    swallowError: false
};

export default class WebpackShellPlugin {
    private options: Options;

    constructor(options: Options) {
        this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
        if (this.options.verbose) {
            this.warn(`WebpackShellPlugin [${new Date()}]: Verbose is being deprecated, please remove.`);
        }

        this.onCompilation = this.onCompilation.bind(this);
        this.onAfterEmit = this.onAfterEmit.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onInvalid = this.onInvalid.bind(this);
        this.putsAsync = this.putsAsync.bind(this);
        this.puts = this.puts.bind(this);
    }

    private putsAsync(resolve: () => void) {
        return (error: Error, stdout: Readable, stderr: Readable) => {
            if (error && !this.options.swallowError) {
                throw error;
            }
            resolve();
        };
    }

    private puts(error: Error, stdout: Readable, stderr: Readable) {
        if (error && !this.options.swallowError) {
            throw error;
        }
    }

    private spreadStdoutAndStdErr(proc: ChildProcess) {
        if (!proc.stdout || !proc.stderr) return;
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stdout);
    }

    private serializeScript(script: string|Script): Script {
        if (typeof script === 'string') {
            const [command, ...args] = script.split(' ');
            return { command, args };
        }
        const { command, args } = script;
        return { command, args };
    }

    private handleScript(script: string) {
        if (os.platform() === 'win32' || this.options.safe) {
            execSync(script, { maxBuffer: Number.MAX_SAFE_INTEGER, stdio: this.options.logging ? [0, 1, 2] : undefined });
        } else {
            const { command, args } = this.serializeScript(script);
            let env = Object.create(global.process.env);
            env = Object.assign(env, this.options.env);
            spawnSync(command, args, { stdio: this.options.logging ? 'inherit' : undefined, env });
        }
    }

    private handleScriptAsync(script: string, blocking = false) {
        if (os.platform() === 'win32' || this.options.safe) {
            return new Promise((resolve) => {
                // @ts-ignore
                this.spreadStdoutAndStdErr(exec(script, this.putsAsync(resolve)));
            });
        }

        const { command, args } = this.serializeScript(script);
        const proc = spawn(command, args, { stdio: 'inherit' });
        return new Promise((resolve) => proc.on('close', this.putsAsync(resolve)));
    }

    private async executeScripts(scripts: string[], parallel: boolean = false, blocking: boolean = false) {
        if (!scripts || scripts.length <= 0) {
            return;
        }

        if (blocking && !parallel) {
            for (let i = 0; i < scripts.length; i++) {
                this.handleScript(scripts[i]);
            }
        } else if (!blocking && !parallel) {
            for (let i = 0; i < scripts.length; i++) {
                await this.handleScriptAsync(scripts[i]);
            }
        } else if (blocking && parallel) {
            throw new Error('Not supported');
        } else if (!blocking && parallel) {
            for (let i = 0; i < scripts.length; i++) {
                this.handleScriptAsync(scripts[i], blocking);
            }
        }
    }

    private validateInput(options: Options): Options {
        if (typeof options.onBeforeBuild === 'string') {
            options.onBeforeBuild = { scripts: options.onBeforeBuild.split('&&') };
        }
        if (typeof options.onBuildStart === 'string') {
            options.onBuildStart = { scripts: options.onBuildStart.split('&&') };
        }
        if (typeof options.onBuildEnd === 'string') {
            options.onBuildEnd = { scripts: options.onBuildEnd.split('&&') };
        }
        if (typeof options.onBuildExit === 'string') {
            options.onBuildExit = { scripts: options.onBuildExit.split('&&') };
        }
        if (typeof options.onBuildError === 'string') {
            options.onBuildError = { scripts: options.onBuildError.split('&&') };
        }
        return options;
    }

    private mergeOptions(provided: Options, defaults: Options): Options {
        const options: Options = {};
        for (const key in defaults) {
            // @ts-ignore
            options[key] = JSON.parse(JSON.stringify(provided.hasOwnProperty(key) ? provided[key] : defaults[key]));
        }
        return options;
    }

    apply(compiler: webpack.Compiler) {
        if (compiler.hooks) {
            compiler.hooks.invalid.tap('webpack-shell-plugin-next', this.onInvalid);
            compiler.hooks.compilation.tap('webpack-shell-plugin-next', this.onCompilation);
            compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', this.onAfterEmit);
            compiler.hooks.done.tapAsync('webpack-shell-plugin-next', this.onDone);
        } else {
            compiler.plugin('invalid', this.onInvalid);
            compiler.plugin('compilation', this.onCompilation);
            compiler.plugin('after-emit', this.onAfterEmit);
            compiler.plugin('done', this.onDone);
        }
    }

    private readonly onInvalid = async (compilation: string): Promise<void> => {
        const onBeforeBuild = this.options.onBeforeBuild;
        if (!onBeforeBuild || typeof onBeforeBuild === 'string') return;
        if (onBeforeBuild.scripts && onBeforeBuild.scripts.length) {
            this.log('Executing before build scripts');
            await this.executeScripts(onBeforeBuild.scripts, onBeforeBuild.parallel, onBeforeBuild.blocking);
            if (this.options.dev) {
                this.options.onBeforeBuild = JSON.parse(JSON.stringify(defaultTask));
            }
        }
    };

    private readonly onCompilation = async (compilation: webpack.compilation.Compilation): Promise<void> => {
        const onBuildStartOption = this.options.onBuildStart;
        if (!onBuildStartOption || typeof onBuildStartOption === 'string') return;
        if (onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0) {
            this.log('Executing pre-build scripts');
            await this.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking);
            if (this.options.dev) {
                this.options.onBuildStart = JSON.parse(JSON.stringify(defaultTask));
            }
        }
    };

    private readonly onAfterEmit = async (compilation: webpack.compilation.Compilation, callback?: Function): Promise<void> => {
        const onBuildEndOption = this.options.onBuildEnd;
        if (!onBuildEndOption || typeof onBuildEndOption === 'string') return;
        if (onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0) {
            this.log('Executing post-build scripts');
            await this.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking);
            if (this.options.dev) {
                this.options.onBuildEnd = JSON.parse(JSON.stringify(defaultTask));
            }
        }
        if (callback) {
            callback();
        }
    };

    private readonly onDone = async (compilation: webpack.Stats, callback?: Function): Promise<void> => {
        if (compilation.hasErrors()) {
            const onBuildError = this.options.onBuildError;
            if (onBuildError &&
                typeof onBuildError !== 'string' &&
                onBuildError.scripts &&
                onBuildError.scripts.length > 0
            ) {
                this.warn('Executing error scripts before exit');
                await this.executeScripts(onBuildError.scripts, onBuildError.parallel, onBuildError.blocking);
            }
        }
        const onBuildExitOption = this.options.onBuildExit;
        if (!onBuildExitOption || typeof onBuildExitOption === 'string') {
            if (callback) {
                callback();
            }
            return;
        }
        if (onBuildExitOption.scripts && onBuildExitOption.scripts.length > 0) {
            this.log('Executing additional scripts before exit');
            await this.executeScripts(onBuildExitOption.scripts, onBuildExitOption.parallel, onBuildExitOption.blocking);
        }
        if (callback) {
            callback();
        }
    };

    private log(text: string) {
        if (this.options.logging) {
            console.log(text);
        }
    }
    private warn(text: string) {
        if (this.options.logging) {
            console.warn(text);
        }
    }
}

module.exports = WebpackShellPlugin;
