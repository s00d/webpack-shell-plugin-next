const path = require('path');
const webpack = require('webpack');

const WebpackShellPlugin = require('./lib');

module.exports = {
  watch: true,
  entry: path.resolve(__dirname, 'test/entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    rules: [
        {
          test: /\.css$/,
          use: [
            {loader: 'style!css'}
          ]
        }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildStart: {
        scripts: ['echo "onBuildStart"'],
        blocking: true,
        parallel: false
      },
      onBuildEnd: {
        scripts: ['echo "onBuildEnd"'],
      },
      onBuildExit: {
        scripts: ['echo "wait sleep 20"', 'sleep 20', 'node test.js', 'echo "end onBuildExit"'],
        parallel: false,
        blocking: true,
      },
      onBuildError: {
        scripts: ['echo "Webpack ERROR"'],
        parallel: false,
        blocking: true,
      },
      dev: true,
      safe: true,
      verbose: true,
      logging: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
