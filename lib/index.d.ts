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
    private putsAsync;
    private puts;
    private spreadStdoutAndStdErr;
    private serializeScript;
    private handleScript;
    private handleScriptAsync;
    private executeScripts;
    private validateInput;
    private mergeOptions;
    apply(compiler: webpack.Compiler): void;
    private readonly onInvalid;
    private readonly onCompilation;
    private readonly onAfterEmit;
    private readonly onDone;
    private log;
    private warn;
}
