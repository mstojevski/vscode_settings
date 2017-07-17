"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const errorHandler_1 = require("./errorHandler");
const utils_1 = require("./utils");
const requirePkg_1 = require("./requirePkg");
const semver = require("semver");
let errorShown = false;
/**
 * Various parser appearance
 */
const PARSER_SINCE = {
    babylon: '0.0.0',
    flow: '0.0.0',
    typescript: '1.4.0-beta',
    postcss: '1.4.0-beta',
    json: '1.5.0',
    graphql: '1.5.0',
};
/**
 * Mark the error as not show, when changing workspaces
 */
utils_1.onWorkspaceRootChange(() => {
    errorShown = false;
});
/**
 * Check if the given parser exists in a prettier module.
 * @param parser parser to test
 * @param prettier Prettier module to test against
 * @returns {boolean} Does the parser exist
 */
function parserExists(parser, prettier) {
    return semver.gte(prettier.version, PARSER_SINCE[parser]);
}
/**
 * Format the given text with user's configuration.
 * @param text Text to format
 * @param path formatting file's path
 * @returns {string} formatted text
 */
function format(text, { fileName, languageId }, customOptions) {
    const config = vscode_1.workspace.getConfiguration('prettier');
    /*
    handle trailingComma changes boolean -> string
    */
    let trailingComma = config.trailingComma;
    if (trailingComma === true) {
        trailingComma = 'es5';
    }
    else if (trailingComma === false) {
        trailingComma = 'none';
    }
    /*
    handle deprecated parser option
    */
    let parser = config.parser;
    let isNonJsParser = false;
    if (!parser) {
        // unset config
        parser = config.useFlowParser ? 'flow' : 'babylon';
    }
    if (config.typescriptEnable.includes(languageId)) {
        parser = 'typescript';
        isNonJsParser = true;
    }
    if (config.cssEnable.includes(languageId)) {
        parser = 'postcss';
        isNonJsParser = true;
    }
    if (config.jsonEnable.includes(languageId)) {
        parser = 'json';
        isNonJsParser = true;
        trailingComma = 'none'; // Fix will land in prettier > 1.5.2
    }
    if (config.graphqlEnable.includes(languageId)) {
        parser = 'graphql';
        isNonJsParser = true;
    }
    const prettierOptions = Object.assign({
        printWidth: config.printWidth,
        tabWidth: config.tabWidth,
        singleQuote: config.singleQuote,
        trailingComma,
        bracketSpacing: config.bracketSpacing,
        jsxBracketSameLine: config.jsxBracketSameLine,
        parser: parser,
        semi: config.semi,
        useTabs: config.useTabs,
    }, customOptions);
    if (config.eslintIntegration && !isNonJsParser) {
        return errorHandler_1.safeExecution(() => {
            const prettierEslint = require('prettier-eslint');
            return prettierEslint({
                text,
                filePath: fileName,
                fallbackPrettierOptions: prettierOptions,
            });
        }, text, fileName);
    }
    const prettier = requirePkg_1.requireLocalPkg(fileName, 'prettier');
    if (isNonJsParser && !parserExists(parser, prettier)) {
        return errorHandler_1.safeExecution(() => {
            const bundledPrettier = require('prettier');
            const warningMessage = `prettier@${prettier.version} doesn't support ${languageId}. ` +
                `Falling back to bundled prettier@${bundledPrettier.version}.`;
            errorHandler_1.addToOutput(warningMessage);
            if (errorShown === false) {
                vscode_1.window.showWarningMessage(warningMessage);
                errorShown = true;
            }
            return bundledPrettier.format(text, prettierOptions);
        }, text, fileName);
    }
    return errorHandler_1.safeExecution(() => prettier.format(text, prettierOptions), text, fileName);
}
function fullDocumentRange(document) {
    const lastLineId = document.lineCount - 1;
    return new vscode_1.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
}
class PrettierEditProvider {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        return [
            vscode_1.TextEdit.replace(fullDocumentRange(document), format(document.getText(), document, {
                rangeStart: document.offsetAt(range.start),
                rangeEnd: document.offsetAt(range.end),
            })),
        ];
    }
    provideDocumentFormattingEdits(document, options, token) {
        return [
            vscode_1.TextEdit.replace(fullDocumentRange(document), format(document.getText(), document, {})),
        ];
    }
}
exports.default = PrettierEditProvider;
//# sourceMappingURL=PrettierEditProvider.js.map