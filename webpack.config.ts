// webpack.config.ts
import * as webpack from 'webpack'
import WebpackShellPlugin from './src'
import * as path from 'path'

const config: webpack.Configuration = {
  mode: 'development',
  entry: path.resolve(__dirname, 'tests/scripts/entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  watchOptions: {
    ignored: ['node_modules/**']
  },
  module: {
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'style!css' }
        ]
      }
    ]
  },
  plugins: [
    new WebpackShellPlugin({
      onAfterDone: {
        scripts: ['exit 1'],
        blocking: true,
        parallel: false,
      },
      onBuildStart: {
        scripts: [
          `echo "test onBuildStart"`,
          'echo "Building ..."'
        ]
      },
      onBuildEnd: {
        scripts: [
          'echo "Done!"'
        ]
      },
      dev: false,
      safe: false,
      logging: true
    }),
    new WebpackShellPlugin({
      onBeforeBuild: {
        scripts: [
          `echo "test onBeforeBuild"`,
          'echo "Building ..."'
        ]
      },
      dev: false,
      safe: false,
      logging: true
    })
  ]
}

export default config
