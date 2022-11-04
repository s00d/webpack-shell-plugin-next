export declare type Task = Function | string;
export declare type Tasks = {
    scripts?: Task[];
    blocking?: boolean;
    parallel?: boolean;
};
export declare type Script = {
    command: string;
    args: string[];
};
export declare type Options = {
    /** Scripts to execute before normal run (without --watch). Defaults to []. */
    onBeforeNormalRun?: Tasks | string | Function;
    /** Scripts to execute on the before build. Defaults to []. */
    onBeforeBuild?: Tasks | string | Function;
    /** Scripts to execute on the before error. Defaults to []. */
    onFailedBuild?: Tasks | string | Function;
    /** Scripts to execute on the initial build. Defaults to []. */
    onBuildStart?: Tasks | string | Function;
    /**
     * Scripts to execute after files are emitted at the end of the
     * compilation. Defaults to [].
     */
    onBuildEnd?: Tasks | string | Function;
    /** Scripts to execute after Webpack's process completes. Defaults to []. */
    onBuildExit?: Tasks | string | Function;
    /** Scripts to execute after Webpack's process Error. Defaults to []. */
    onBuildError?: Tasks | string | Function;
    /** Scripts to execute after onWatchRun. Defaults to []. */
    onWatchRun?: Tasks | string | Function;
    /** Scripts to execute after files are emitted at the end with watch. Defaults to []. */
    onDoneWatch?: Tasks | string | Function;
    /** Scripts to execute after done. Defaults to []. */
    onAfterDone?: Tasks | string | Function;
    /**
     * Switch for development environments. This causes scripts to execute once.
     * Useful for running HMR on webpack-dev-server or webpack watch mode.
     * Defaults to true.
     */
    dev?: boolean;
    /**
     * Object with environment variables that will be applied to the executables
     */
    env?: any;
    /**
     * Switches script execution process from spawn to exec. If running into
     * problems with spawn, turn this setting on. Defaults to false.
     */
    safe?: boolean;
    /**
     * show log message
     */
    logging?: boolean;
    /**
     * ignore script errors (useful in watch mode)
     */
    swallowError?: boolean;
    /**
     * run command in shell. Default: true
     */
    shell?: boolean;
    /** DEPRECATED. Enable for verbose output. Defaults to false. */
    verbose?: boolean;
};
