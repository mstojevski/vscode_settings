"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
let currentRootPath = vscode_1.workspace.rootPath;
function onWorkspaceRootChange(cb) {
    vscode_1.workspace.onDidChangeConfiguration(() => {
        if (currentRootPath !== vscode_1.workspace.rootPath) {
            cb(vscode_1.workspace.rootPath);
            currentRootPath = vscode_1.workspace.rootPath;
        }
    });
}
exports.onWorkspaceRootChange = onWorkspaceRootChange;
//# sourceMappingURL=utils.js.map