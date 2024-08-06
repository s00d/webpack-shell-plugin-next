import path from 'path'
import WebpackShellPlugin from '../src/index'
import Webpack from 'webpack'
import fs from 'fs'
import WebpackShellPluginNext from '../src'
import { rimraf } from 'rimraf'

// tslint:disable-next-line:no-empty
console.log = (data: any) => {}

beforeEach(() => {
  return rimraf.sync(path.resolve(__dirname, 'out'))
})

afterEach(() => {
  return rimraf.sync(path.resolve(__dirname, 'out'))
})

it('Supports an entry', () => {
  expect(() => {
    Webpack({
      entry: './webpack/index.js',
      output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'bundle.js'
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
          }
        })
      ]
    })
  }).not.toThrow()
})

it('Check scripts exec', (done) => {
  Webpack({
    entry: path.resolve(__dirname, './webpack/index.js'),
    output: {
      path: path.resolve(__dirname, 'out'),
      filename: 'bundle.js'
    },
    plugins: [
      new WebpackShellPlugin({
        onBuildExit: {
          scripts: [
            'node ./tests/scripts/big_data.js'
          ],
          blocking: true,
          parallel: false
        }
      })
    ]
  }, (error, stats) => {
    done(error)
  })
})

it('Check scripts exit code', (done) => {
  Webpack({
    entry: path.resolve(__dirname, './webpack/index.js'),
    output: {
      path: path.resolve(__dirname, 'out'),
      filename: 'bundle.js'
    },
    plugins: [
      new WebpackShellPlugin({
        logging: false,
        onBuildExit: {
          scripts: [
            'node ./tests/scripts/exit-code-1.js'
          ],
          blocking: true,
          parallel: false
        }
      })
    ]
  }, () => {
    done()
  })
})

it('Check scripts with file', (done) => {
  Webpack({
    entry: path.resolve(__dirname, './webpack/index.js'),
    output: {
      path: path.resolve(__dirname, 'out'),
      filename: 'bundle.js'
    },
    plugins: [
      new WebpackShellPlugin({
        logging: false,
        onBuildExit: {
          scripts: [
            'node ./tests/scripts/file.js'
          ],
          blocking: true,
          parallel: false
        }
      })
    ]
  }, () => {
    expect(fs.existsSync(path.join(__dirname, './out/test.txt'))).toBe(true)
    done()
  })
})

it('Check scripts run', (done) => {
  Webpack({
    entry: path.resolve(__dirname, './webpack/index.js'),
    output: {
      path: path.resolve(__dirname, 'out'),
      filename: 'bundle.js'
    },
    plugins: [
      new WebpackShellPlugin({
        onBuildExit: {
          scripts: [
            () => new Promise((resolve, reject) => {
              fs.writeFileSync(path.join(__dirname, './out/run.txt'), 'Hey there!')
              resolve('ok')
            })
          ],
          blocking: true,
          parallel: false
        }
      })
    ]
  }, (error, stats) => {
    if (error) {
      throw Error(error.message)
    }
    expect(fs.existsSync(path.join(__dirname, './out/run.txt'))).toBe(true)
    expect(fs.existsSync(path.join(__dirname, './out/bundle.js'))).toBe(true)
    done()
  })
})

describe('testEvents', () => {
  const error = {
    name: 'errorName',
    message: 'errorMessage'
  }
  let consoleOutput: Array<string> = []
  const mockedLog = (output: string) => consoleOutput.push(output)
  beforeEach(() => (consoleOutput = []))
  afterEach(() => (consoleOutput = []))

  it('work test', (done) => {
    consoleOutput = []
    Webpack({
      entry: path.resolve(__dirname, './webpack/index.js'),
      output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'bundle.js'
      },
      plugins: [
        new WebpackShellPlugin({
          onBuildExit: {
            scripts: [
              () => new Promise((resolve, reject) => {
                mockedLog('test 1')
                resolve('ok')
              })
            ],
            blocking: true,
            parallel: false
          }
        })
      ]
    }, (error, stats) => {
      expect(consoleOutput).toEqual([
        'test 1'
      ])
      done(error)
    })
  })

  it('test queue', (done) => {
    consoleOutput = []
    Webpack({
      entry: path.resolve(__dirname, './webpack/index.js'),
      output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'bundle.js'
      },
      plugins: [
        new WebpackShellPlugin({
          onBeforeNormalRun: () => mockedLog('onBeforeNormalRun'),
          onBeforeBuild: () => mockedLog('onBeforeBuild'),
          onBuildStart: () => mockedLog('onBuildStart'),
          onBuildEnd: () => mockedLog('onBuildEnd'),
          onBuildExit: () => mockedLog('onBuildExit'),
          onBuildError: () => mockedLog('onBuildError'),
          onWatchRun: () => mockedLog('onWatchRun'),
          onDoneWatch: () => mockedLog('onDoneWatch'),
          onAfterDone: () => mockedLog('onAfterDone')
        })
      ]
    }, (error, stats) => {
      setTimeout(() => {
        expect(consoleOutput).toEqual([
          'onBeforeNormalRun',
          'onBuildStart',
          'onBeforeBuild',
          'onBuildEnd',
          'onBuildExit',
          'onAfterDone'
        ])
        done(error)
      }, 100)
    })
  })

  it('test onBeforeBuild', (done) => {
    consoleOutput = []
    Webpack({
      entry: path.resolve(__dirname, './webpack/index.js'),
      output: {
        path: path.resolve(__dirname, 'out'),
        filename: 'bundle.js'
      },
      plugins: [
        new WebpackShellPlugin({
          onBeforeBuild: () => mockedLog('onBeforeBuild'),
        })
      ]
    }, (error, stats) => {
      setTimeout(() => {
        expect(consoleOutput).toEqual([
          'onBeforeBuild',
        ])
        done(error)
      }, 100)
    })
  })

  it('test onBeforeCompile', (done) => {
    consoleOutput = []
    Webpack(
      {
        entry: path.resolve(__dirname, './webpack/index.js'),
        output: {
          path: path.resolve(__dirname, 'out'),
          filename: 'bundle.js',
        },
        plugins: [
          new WebpackShellPluginNext({
            onAfterDone: () => mockedLog('onAfterDone'),
            onBeforeCompile: () => mockedLog('onBeforeCompile'),
          }),
        ],
      },
      (error, stats) => {
        setTimeout(() => {
          expect(consoleOutput).toEqual(['onBeforeCompile', 'onAfterDone'])
          done(error)
        }, 200)
      }
    )
  })
})
