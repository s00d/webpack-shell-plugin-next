[![npm version](https://badge.fury.io/js/webpack-shell-plugin-next.svg)](https://badge.fury.io/js/webpack-shell-plugin-next)
# Webpack Shell Plugin Next

fix webpack 4 deprecated method.

This plugin allows you to run any shell commands before or after webpack 4 builds. This will work for both webpack 4.

Goes great with running cron jobs, reporting tools, or tests such as selenium, protractor, phantom, ect.

## WARNING

This plugin is meant for running simple command line executions. It is not meant to be a task management tool.

## Installation

`npm install --save-dev webpack-shell-plugin-next`

## Setup
In `webpack.config.js`:

```js
const WebpackShellPlugin = require('webpack-shell-plugin-next');

module.exports = {
  ...
  ...
  plugins: [
    new WebpackShellPlugin({
      onBuildStart:{
        scripts: ['echo "Webpack Start"'],
        blocking: true,
        parallel: false
      }, 
      onBuildEnd:{
        scripts: ['echo "Webpack End"'],
        blocking: false,
        parallel: true
      }
    })
  ],
  ...
}
```

### API

* `onBuildStart`: configuration object for scripts that execute before a compilation. 
**Default:**
```js
  {
    scripts: [],
    blocking: false,
    parallel: false
  }
```
* `onBuildEnd`: configuration object for scripts that execute after files are emitted at the end of the compilation. 
**Default:**
```js
  {
    scripts: [],
    blocking: false,
    parallel: false
  }
```
* `onBuildExit`: configuration object for scripts that execute after webpack's process is complete. *Note: this event also fires in `webpack --watch` when webpack has finished updating the bundle.*
**Default:**
```js
  {
    scripts: [],
    blocking: false,
    parallel: false
  }
```
* `blocking (onBuildStart, onBuildEnd, onBuildExit)`: block webpack until scripts finish execution.
* `parallel (onBuildStart, onBuildEnd, onBuildExit)`: execute scripts in parallel, otherwise execute scripts in the order in which they are specified in the scripts array.

**Note:** below combination is not supported.
 ```js
  {
    blocking: true
    parallel: true
  } 
 ```

* `dev`: switch for development environments. This causes scripts to execute once. Useful for running HMR on webpack-dev-server or webpack watch mode. **Default: true**
* `safe`: switches script execution process from spawn to exec. If running into problems with spawn, turn this setting on. **Default: false**

### Developing

If opening a pull request, create an issue describing a fix or feature. Have your pull request point to the issue by writing your commits with the issue number in the message.

Make sure you lint your code by running `npm run lint` and you can build the library by running `npm run build`.

I appreciate any feed back as well, Thanks for helping!

### Contributions
Yair Tavor
