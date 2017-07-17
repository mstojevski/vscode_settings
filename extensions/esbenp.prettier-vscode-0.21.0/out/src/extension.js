"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const PrettierEditProvider_1 = require("./PrettierEditProvider");
const errorHandler_1 = require("./errorHandler");
function checkConfig() {
    const config = vscode_1.workspace.getConfiguration('prettier');
    if (config.useFlowParser) {
        vscode_1.window.showWarningMessage("Option 'useFlowParser' has been deprecated. " +
            'Use \'parser: "flow"\' instead.');
    }
    if (typeof config.trailingComma === 'boolean') {
        vscode_1.window.showWarningMessage("Option 'trailingComma' as a boolean value has been deprecated. " +
            "Use 'none', 'es5' or 'all' instead.");
    }
    return config;
}
function activate(context) {
    const editProvider = new PrettierEditProvider_1.default();
    const config = checkConfig();
    const languageSelector = [
        ...config.javascriptEnable,
        ...config.typescriptEnable,
        ...config.cssEnable,
        ...config.jsonEnable,
        ...config.graphqlEnable,
    ];
    // CSS/json/graphql doesn't work with range yet.
    const rangeLanguageSelector = [
        ...config.javascriptEnable,
        ...config.typescriptEnable,
    ];
    context.subscriptions.push(vscode_1.languages.registerDocumentRangeFormattingEditProvider(rangeLanguageSelector, editProvider), vscode_1.languages.registerDocumentFormattingEditProvider(languageSelector, editProvider), errorHandler_1.setupErrorHandler());
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map