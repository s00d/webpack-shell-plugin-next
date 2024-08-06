export type Task = Function | string;
export type Tasks = {
    scripts?: Task[];
    blocking?: boolean;
    parallel?: boolean;
};
export type Script = {
    command: string;
    args: string[];
};
export type Options = {
    /**
     * Scripts to execute before a normal run (without --watch).
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBeforeNormalRun?: Tasks | string | Function;
    /**
     * Scripts to execute before the build process starts.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBeforeBuild?: Tasks | string | Function;
    /**
     * Scripts to execute when the build fails.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onFailedBuild?: Tasks | string | Function;
    /**
     * Scripts to execute at the start of the build process.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBuildStart?: Tasks | string | Function;
    /**
     * Scripts to execute after files are emitted at the end of the compilation.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBuildEnd?: Tasks | string | Function;
    /**
     * Scripts to execute after Webpack's process completes.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBuildExit?: Tasks | string | Function;
    /**
     * Scripts to execute after a build error occurs.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBuildError?: Tasks | string | Function;
    /**
     * Scripts to execute before each watch run.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onWatchRun?: Tasks | string | Function;
    /**
     * Scripts to execute after files are emitted at the end of each watch cycle.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onDoneWatch?: Tasks | string | Function;
    /**
     * Scripts to execute after the entire Webpack process is done.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onAfterDone?: Tasks | string | Function;
    /**
     * Scripts to execute before the compilation process starts.
     * Can be a Tasks object, a single script string, or a function.
     * Defaults to [].
     */
    onBeforeCompile?: Tasks | string | Function;
    /**
     * Switch for development environments. This causes scripts to execute once.
     * Useful for running HMR on webpack-dev-server or webpack watch mode.
     * Defaults to true.
     */
    dev?: boolean;
    /**
     * Object with environment variables that will be applied to the executables.
     */
    env?: any;
    /**
     * Switches script execution process from spawn to exec. If running into
     * problems with spawn, turn this setting on. Defaults to false.
     */
    safe?: boolean;
    /**
     * Show log messages. Defaults to true.
     */
    logging?: boolean;
    /**
     * Ignore script errors (useful in watch mode). Defaults to false.
     */
    swallowError?: boolean;
    /**
     * Run command in shell. Defaults to true.
     */
    shell?: boolean;
    /**
     * DEPRECATED. Enable for verbose output. Defaults to false.
     */
    verbose?: boolean;
};
