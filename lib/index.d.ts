/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */
import { Options } from './types';
import * as webpack from 'webpack';
export default class WebpackShellPlugin {
    private onBeforeNormalRun;
    private onBeforeBuild;
    private onBuildStart;
    private onBuildEnd;
    private onBuildExit;
    private onBuildError;
    private onWatchRun;
    private onDoneWatch;
    private onAfterDone;
    private onFailedBuild;
    private env;
    private dev;
    private shell;
    private safe;
    private logging;
    private swallowError;
    private validateEvent;
    constructor(options: Options);
    private putsAsync;
    private puts;
    private spreadStdoutAndStdErr;
    private serializeScript;
    private handleScript;
    private handleScriptAsync;
    private executeScripts;
    apply(compiler: webpack.Compiler): void;
    private readonly onBeforeRun;
    private readonly afterDone;
    private readonly afterCompile;
    private readonly onFailed;
    private readonly onBefore;
    private readonly onCompilation;
    private readonly onAfterEmit;
    private readonly onDone;
    private readonly watchRun;
    private log;
    private warn;
    private error;
}
