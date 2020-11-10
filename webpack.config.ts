// webpack.config.ts
import * as webpack from 'webpack'
import WebpackShellPlugin from './src'
import * as path from 'path'

const config: webpack.Configuration = {
  mode: 'development',
  entry: path.resolve(__dirname, 'test/entry.js'),
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
      onBeforeNormalRun: {
        scripts: [
          'echo "onBeforeRun"',
          'sleep 1'
        ],
        blocking: true,
        parallel: false
      },
      onBuildStart: {
        scripts: [
          'echo "onBuildStart"',
          'sleep 1'
        ],
        blocking: true,
        parallel: false
      },
      onBuildEnd: {
        scripts: [
          'echo "onBuildEnd"',
          () => {
            console.log('run tTimeout 1')
            setTimeout(() => console.log('end Timeout 1'), 1000)
          },
          () => {
            console.log('run tTimeout 2')
            setTimeout(() => console.log('end Timeout 2'), 1000)
          },
          () => {
            console.log('run tTimeout 3')
            setTimeout(() => console.log('end Timeout 3'), 1000)
          },
          // () => console.log('run sync tTimeout 2'),
          'echo "wait sleep 2"',
          'sleep 2',
          'echo "end"'
        ],
        blocking: true
      },
      onBuildExit: {
        scripts: [
          'echo "onBuildExit"',
          () => new Promise((resolve, reject) => {
            console.log('run async tTimeout')
            setTimeout(() => {
              console.log('end async tTimeout')
              resolve()
            }, 500)
          }),
          () => {
            console.log('run sync tTimeout 2')
            setTimeout(() => console.log('end sync Timeout 2'), 100)
          },
          // () => console.log('run sync tTimeout 2'),
          'echo "wait sleep 2"',
          'sleep 2',
          'node ./test/exit-code-1.js',
          'node ./test/big_data.js',
          'echo "wait sleep 2"',
          'sleep 2',
          'echo "end onBuildExit"'
        ],
        blocking: true,
        parallel: false
      },
      onBuildError: {
        scripts: ['echo "Webpack ERROR"'],
        parallel: false,
        blocking: true
      },
      onWatchRun: {
        scripts: ['echo "Webpack onWatchRun"'],
        parallel: false,
        blocking: true
      },
      onDoneWatch: {
        scripts: ['echo "Webpack onDoneWatch"'],
        parallel: false,
        blocking: true
      },
      onAfterDone: {
        scripts: ['echo "Webpack onAfterDone"'],
        parallel: false,
        blocking: true
      },
      dev: false,
      safe: false,
      logging: true
    })
  ]
}

export default config
