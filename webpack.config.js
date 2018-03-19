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
  /*devServer: {
    contentBase: path.resolve(__dirname, 'test')
  },*/
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    rules: [
        {
          test: /\.css$/,
          use: [
            {loader: "style"},
            {loader: "css-loader"}
          ]
        }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildStart: {
        scripts: [],
        blocking: true,
        parallel: true
      },
      onBuildEnd: {

      },
      onBuildExit: {
        scripts: ['node test.js', 'echo "second"', 'echo "third"'],
        parallel: true
      },
      dev: true, safe: true, verbose: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
