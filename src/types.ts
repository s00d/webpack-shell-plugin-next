import { WebpackError } from 'webpack'

export type FunctionWithErrors = (errors?:WebpackError[]) => void
export type OnError = 'skip' | 'execute'

export type TaskOption = Task | Tasks
export type Task = Function | string
export type Tasks = {
  scripts?: Task[],
  blocking?: boolean,
  parallel?: boolean
}

export type TaskOptionWithErrors = TaskWithErrors | TasksWithErrors
export type TaskWithErrors = Exclude<Task, Function> | FunctionWithErrors
export type TasksWithErrors = Omit<Tasks, 'scripts'> & {
  scripts?: TaskWithErrors[]
  onError?: OnError
}

export type OnBuildErrorOption = OnBuildErrorTasks | TaskWithErrors
export type OnBuildErrorTasks = Omit<TasksWithErrors, 'onError'>

export type Script = {
  command: string,
  args: string[]
}

export type Options = {
  /** Scripts to execute before normal run (without --watch). Defaults to []. */
  onBeforeNormalRun?: TaskOption
  /** Scripts to execute on the before build. Defaults to []. */
  onBeforeBuild?: TaskOption
  /** Scripts to execute on the initial build. Defaults to []. */
  onBuildStart?: TaskOption
  /**
   * Scripts to execute after files are emitted at the end of the
   * compilation. Defaults to [].
   */
  onBuildEnd?: TaskOption
  /** Scripts to execute after Webpack's process completes. Defaults to []. */
  onBuildExit?: TaskOptionWithErrors
  /** Scripts to execute after Webpack's process Error. Defaults to []. */
  onBuildError?: OnBuildErrorOption
  /** Scripts to execute after onWatchRun. Defaults to []. */
  onWatchRun?: TaskOption
  /** Scripts to execute after files are emitted at the end with watch. Defaults to []. */
  onDoneWatch?: TaskOption
  /** Scripts to execute after done. Defaults to []. */
  onAfterDone?: TaskOptionWithErrors

  /**
   * Switch for development environments. This causes scripts to execute once.
   * Useful for running HMR on webpack-dev-server or webpack watch mode.
   * Defaults to true.
   */
  dev?: boolean

  /**
   * Object with environment variables that will be applied to the executables
   */
  env?: any

  /**
   * Switches script execution process from spawn to exec. If running into
   * problems with spawn, turn this setting on. Defaults to false.
   */
  safe?: boolean

  /**
   * show log message
   */
  logging?: boolean

  /**
   * ignore script errors (useful in watch mode)
   */
  swallowError?: boolean

  /**
   * run command in shell. Default: true
   */
  shell?: boolean

  /** DEPRECATED. Enable for verbose output. Defaults to false. */
  verbose?: boolean
}
