/**
 * @class WebpackShellPluginNext
 * @extends Object
 * Run shell commands before and after webpack builds
 */
import { Options } from './types';
import * as webpack from 'webpack';
export default class WebpackShellPlugin {
    private options;
    constructor(options: Options);
    private mergeOptions;
    private validateInput;
    private putsAsync;
    private puts;
    private static spreadStdoutAndStdErr;
    private serializeScript;
    private handleScript;
    private handleScriptAsync;
    private executeScripts;
    apply(compiler: webpack.Compiler): void;
    private readonly onInvalid;
    private readonly onCompilation;
    private readonly onAfterEmit;
    private readonly onDone;
    private log;
    private warn;
}
