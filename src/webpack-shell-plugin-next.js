const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const spawnSync = require('child_process').spawnSync;
const execSync = require('child_process').execSync;
const os = require('os');
if (!global._babelPolyfill) {
  require('babel-polyfill');
}

const defaultOptions = {
  onBuildStart: {
    scripts: [],
    blocking: false,
    parallel: false
  },
  onBuildEnd: {
    scripts: [],
    blocking: false,
    parallel: false
  },
  onBuildExit: {
    scripts: [],
    blocking: false,
    parallel: false
  },
  dev: true,
  safe: false
};

export default class WebpackShellPlugin {
  constructor(options) {
    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  putsAsync(resolve) {
    return (error, stdout, stderr) => {
      if (error) {
        throw error;
      }
      resolve();
    }
  }

  spreadStdoutAndStdErr(proc) {
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stdout);
  }

  serializeScript(script) {
    if (typeof script === 'string') {
      const [command, ...args] = script.split(' ');
      return {command, args};
    }
    const {command, args} = script;
    return {command, args};
  }

  handleScript(script) {
    if (os.platform() === 'win32' || this.options.safe) {
      const buffer = execSync(script, {stdio: 'inherit'});
    } else {
      const {command, args} = this.serializeScript(script);
      spawnSync(command, args, {stdio: 'inherit'});
    }
  }

  handleScriptAsync(script) {
    if (os.platform() === 'win32' || this.options.safe) {
      return new Promise((resolve) => {
        this.spreadStdoutAndStdErr(exec(script, this.putsAsync(resolve)))
      });
    }

    const {command, args} = this.serializeScript(script);
    const proc = spawn(command, args, {stdio: 'inherit'});
    return new Promise((resolve) => proc.on('close', this.putsAsync(resolve)));
  }

  async executeScripts(scripts, parallel, blocking) {
    if (!scripts || scripts.length <= 0) {
      return;
    }

    if (blocking && !parallel) {
      for (let i = 0; i < scripts.length; i++) {
        this.handleScript(scripts[i]);
      }
    }
    else if (!blocking && !parallel) {
      for (let i = 0; i < scripts.length; i++) {
        await this.handleScriptAsync(scripts[i]);
      }
    }
    else if (blocking && parallel) {
      throw new Exception("Not supported");
    }
    else if (!blocking && parallel) {
      for (let i = 0; i < scripts.length; i++) {
        this.handleScriptAsync(scripts[i], blocking);
      }
    }
  }

  validateInput(options) {
    if (typeof options.onBuildStart === 'string') {
      options.onBuildStart.scripts = options.onBuildStart.split('&&');
    }
    if (typeof options.onBuildEnd === 'string') {
      options.onBuildEnd.scripts = options.onBuildEnd.split('&&');
    }
    if (typeof options.onBuildExit === 'string') {
      options.onBuildExit.scripts = options.onBuildExit.split('&&');
    }
    return options;
  }

  mergeOptions(options, defaults) {
    for (const key in defaults) {
      if (options.hasOwnProperty(key)) {
        defaults[key] = options[key];
      }
    }
    return defaults;
  }

  
  apply(compiler) {
    compiler.hooks.compilation.tap('webpack-shell-plugin-next', (compilation) => {
      const onBuildStartOption = this.options.onBuildStart;
      if (this.options.verbose) {
        console.log(`Report compilation: ${compilation}`);
        console.warn(`WebpackShellPlugin [${new Date()}]: Verbose is being deprecated, please remove.`);
      }
      if (onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0) {
        console.log('Executing pre-build scripts');
        this.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking);

        if (this.options.dev) {
          this.options.onBuildStart = [];
        }
      }
    });

    compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', (compilation, callback) => {
      const onBuildEndOption = this.options.onBuildEnd;
      if (onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0) {
        console.log('Executing post-build scripts');
        this.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking);
        if (this.options.dev) {
          this.options.onBuildEnd = [];
        }
      }
      callback();
    });

    compiler.hooks.done.tap('webpack-shell-plugin-next', () => {
      const onBuildExitOption = this.options.onBuildExit;
      if (onBuildExitOption.scripts && onBuildExitOption.scripts.length > 0) {
        console.log('Executing additional scripts before exit');
        this.executeScripts(onBuildExitOption.scripts, onBuildExitOption.parallel, onBuildExitOption.blocking);
      }
    });
  }
}
