'use strict';

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

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
var spawnSync = require('child_process').spawnSync;
var execSync = require('child_process').execSync;
var os = require('os');
if (!global._babelPolyfill) {
  require('babel-polyfill');
}

var defaultOptions = {
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

var WebpackShellPlugin = function () {
  function WebpackShellPlugin(options) {
    classCallCheck(this, WebpackShellPlugin);

    this.options = this.validateInput(this.mergeOptions(options, defaultOptions));
  }

  createClass(WebpackShellPlugin, [{
    key: 'putsAsync',
    value: function putsAsync(resolve) {
      return function (error, stdout, stderr) {
        if (error) {
          throw error;
        }
        resolve();
      };
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
        var buffer = execSync(script, { stdio: 'inherit' });
      } else {
        var _serializeScript = this.serializeScript(script),
            command = _serializeScript.command,
            args = _serializeScript.args;

        spawnSync(command, args, { stdio: 'inherit' });
      }
    }
  }, {
    key: 'handleScriptAsync',
    value: function handleScriptAsync(script) {
      var _this = this;

      if (os.platform() === 'win32' || this.options.safe) {
        return new Promise(function (resolve) {
          _this.spreadStdoutAndStdErr(exec(script, _this.putsAsync(resolve)));
        });
      }

      var _serializeScript2 = this.serializeScript(script),
          command = _serializeScript2.command,
          args = _serializeScript2.args;

      var proc = spawn(command, args, { stdio: 'inherit' });
      return new Promise(function (resolve) {
        return proc.on('close', _this.putsAsync(resolve));
      });
    }
  }, {
    key: 'executeScripts',
    value: function () {
      var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scripts, parallel, blocking) {
        var i, _i, _i2;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(!scripts || scripts.length <= 0)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return');

              case 2:
                if (!(blocking && !parallel)) {
                  _context.next = 6;
                  break;
                }

                for (i = 0; i < scripts.length; i++) {
                  this.handleScript(scripts[i]);
                }
                _context.next = 21;
                break;

              case 6:
                if (!(!blocking && !parallel)) {
                  _context.next = 16;
                  break;
                }

                _i = 0;

              case 8:
                if (!(_i < scripts.length)) {
                  _context.next = 14;
                  break;
                }

                _context.next = 11;
                return this.handleScriptAsync(scripts[_i]);

              case 11:
                _i++;
                _context.next = 8;
                break;

              case 14:
                _context.next = 21;
                break;

              case 16:
                if (!(blocking && parallel)) {
                  _context.next = 20;
                  break;
                }

                throw new Exception("Not supported");

              case 20:
                if (!blocking && parallel) {
                  for (_i2 = 0; _i2 < scripts.length; _i2++) {
                    this.handleScriptAsync(scripts[_i2], blocking);
                  }
                }

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function executeScripts(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return executeScripts;
    }()
  }, {
    key: 'validateInput',
    value: function validateInput(options) {
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
      var _this2 = this;

      compiler.hooks.compilation.tap('webpack-shell-plugin-next', function (compilation) {
        var onBuildStartOption = _this2.options.onBuildStart;
        if (_this2.options.verbose) {
          console.log('Report compilation: ' + compilation);
          console.warn('WebpackShellPlugin [' + new Date() + ']: Verbose is being deprecated, please remove.');
        }
        if (onBuildStartOption.scripts && onBuildStartOption.scripts.length > 0) {
          console.log('Executing pre-build scripts');
          _this2.executeScripts(onBuildStartOption.scripts, onBuildStartOption.parallel, onBuildStartOption.blocking);

          if (_this2.options.dev) {
            _this2.options.onBuildStart = [];
          }
        }
      });

      compiler.hooks.afterEmit.tapAsync('webpack-shell-plugin-next', function (compilation, callback) {
        var onBuildEndOption = _this2.options.onBuildEnd;
        if (onBuildEndOption.scripts && onBuildEndOption.scripts.length > 0) {
          console.log('Executing post-build scripts');
          _this2.executeScripts(onBuildEndOption.scripts, onBuildEndOption.parallel, onBuildEndOption.blocking);
          if (_this2.options.dev) {
            _this2.options.onBuildEnd = [];
          }
        }
        callback();
      });

      compiler.hooks.done.tap('webpack-shell-plugin-next', function () {
        var onBuildExitOption = _this2.options.onBuildExit;
        if (onBuildExitOption.scripts && onBuildExitOption.scripts.length > 0) {
          console.log('Executing additional scripts before exit');
          _this2.executeScripts(onBuildExitOption.scripts, onBuildExitOption.parallel, onBuildExitOption.blocking);
        }
      });
    }
  }]);
  return WebpackShellPlugin;
}();

module.exports = WebpackShellPlugin;
//# sourceMappingURL=index.js.map
