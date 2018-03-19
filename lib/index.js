'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var os = require('os');

var defaultOptions = {
  onBuildStart: [],
  onBuildEnd: [],
  onBuildExit: [],
  dev: true,
  safe: false
};

var WebpackShellPlugin = function () {
  function WebpackShellPlugin(options) {
    classCallCheck(this, WebpackShellPlugin);

    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  createClass(WebpackShellPlugin, [{
    key: 'puts',
    value: function puts(error, stdout, stderr) {
      if (error) {
        throw error;
      }
    }
  }, {
    key: 'spreadStdoutAndStdErr',
    value: function spreadStdoutAndStdErr(proc) {
      proc.stdout.pipe(process.stdout);
      proc.stderr.pipe(process.stdout);
    }
  }, {
    key: 'serializeScript',
    value: function serializeScript(script) {
      if (typeof script === 'string') {
        var _script$split = script.split(' '),
            _script$split2 = toArray(_script$split),
            _command = _script$split2[0],
            _args = _script$split2.slice(1);

        return { command: _command, args: _args };
      }
      var command = script.command,
          args = script.args;

      return { command: command, args: args };
    }
  }, {
    key: 'handleScript',
    value: function handleScript(script) {
      if (os.platform() === 'win32' || this.options.safe) {
        this.spreadStdoutAndStdErr(exec(script, this.puts));
      } else {
        var _serializeScript = this.serializeScript(script),
            command = _serializeScript.command,
            args = _serializeScript.args;

        var proc = spawn(command, args, { stdio: 'inherit' });
        proc.on('close', this.puts);
      }
    }
  }, {
    key: 'validateInput',
    value: function validateInput(options) {
      if (typeof options.onBuildStart === 'string') {
        options.onBuildStart = options.onBuildStart.split('&&');
      }
      if (typeof options.onBuildEnd === 'string') {
        options.onBuildEnd = options.onBuildEnd.split('&&');
      }
      if (typeof options.onBuildExit === 'string') {
        options.onBuildExit = options.onBuildExit.split('&&');
      }
      return options;
    }
  }, {
    key: 'mergeOptions',
    value: function mergeOptions(options, defaults$$1) {
      for (var key in defaults$$1) {
        if (options.hasOwnProperty(key)) {
          defaults$$1[key] = options[key];
        }
      }
      return defaults$$1;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.compilation.tap('webpack-shell-plugin-next', function (compilation) {
        if (_this.options.verbose) {
          console.log('Report compilation: ' + compilation);
          console.warn('WebpackShellPlugin [' + new Date() + ']: Verbose is being deprecated, please remove.');
        }
        if (_this.options.onBuildStart.length) {
          console.log('Executing pre-build scripts');
          for (var i = 0; i < _this.options.onBuildStart.length; i++) {
            _this.handleScript(_this.options.onBuildStart[i]);
          }
          if (_this.options.dev) {
            _this.options.onBuildStart = [];
          }
        }
      });

      compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', function (compilation, callback) {
        if (_this.options.onBuildEnd.length) {
          console.log('Executing post-build scripts');
          for (var i = 0; i < _this.options.onBuildEnd.length; i++) {
            _this.handleScript(_this.options.onBuildEnd[i]);
          }
          if (_this.options.dev) {
            _this.options.onBuildEnd = [];
          }
        }
        return callback();
      });

      compiler.hooks.done.tap('webpack-shell-plugin-next', function () {
        if (_this.options.onBuildExit.length) {
          console.log('Executing additional scripts before exit');
          for (var i = 0; i < _this.options.onBuildExit.length; i++) {
            _this.handleScript(_this.options.onBuildExit[i]);
          }
        }
      });
    }
  }]);
  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;
//# sourceMappingURL=index.js.map
