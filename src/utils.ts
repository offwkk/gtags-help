import * as vscode from "vscode";
import * as global from "./global";
import { exec, ExecException } from "child_process";
import { searchGtags } from "./extension";

export function getWorkspaceRootPath(): string {
    return vscode.workspace.workspaceFolders !==
        undefined ? vscode.workspace.workspaceFolders[0].uri.fsPath : '';
}

export async function execCmd(command: string): Promise<string> {
    let dir = getWorkspaceRootPath();

    return new Promise((resolve, reject) => {
        exec(command,
            { cwd: dir },
            (error: ExecException | null, stdout: string, stderr: string) => {
                if (error) {
                    reject(stderr);
                } else {
                    resolve(stdout);
                }
            });
    });
}

export function parseResult(result: string): Array<{ symbol: string, line: number, path: string } | undefined> {
    const lines = result.trimEnd().split('\n');

    return lines.map((line: string) => {
        if (line == null)
            return;

        let groups = line.split(/ +/);
        return { "symbol": groups[0], "line": Number(groups[1]), "path": groups[2] };
    });

}

export async function findDefinition(historyResult?: string): Promise<global.Global[]> {
    let globalCmd = global.getGlobalCmd();
    let definitionGlobal: global.Global[] = [];
    let word;

    if (historyResult) {
        word = historyResult;
    } else {
        const editor = vscode.window.activeTextEditor!;
        const position: vscode.Position = editor.selection.active;
        let wordRange = editor.document.getWordRangeAtPosition(position, /\w+/);
        word = editor.document.getText(wordRange)
    }

    let definitionResult = parseResult(await execCmd(globalCmd + " -x " + word));

    for (let i = 0; i < definitionResult.length; i++) {
        definitionGlobal[i] = new global.Global(
            definitionResult[i]?.symbol!, definitionResult[i]?.line!, definitionResult[i]?.path!);
    }

    return definitionGlobal;
}

export async function findReference(historyResult?: string): Promise<global.Global[]> {
    let globalCmd = global.getGlobalCmd();
    let referenceGlobal: global.Global[] = [];
    let word;

    if (historyResult) {
        word = historyResult;
    } else {
        const editor = vscode.window.activeTextEditor!;
        const position: vscode.Position = editor.selection.active;
        let wordRange = editor.document.getWordRangeAtPosition(position, /\w+/);
        word = editor.document.getText(wordRange)
    }

    let referenceResult = parseResult(await execCmd(globalCmd + " -rx " + word));

    for (let i = 0; i < referenceResult.length; i++) {
        referenceGlobal[i] = new global.Global(
            referenceResult[i]?.symbol!, referenceResult[i]?.line!, referenceResult[i]?.path!);
    }

    return referenceGlobal;
}

export function moveGtags(gtags: global.GlobalResult) {
    if (gtags.symbol === undefined)
        return;

    let path = gtags.fullPath;

    vscode.workspace.openTextDocument(path).then(document => {
        vscode.window.showTextDocument(document).then(editor => {
            var pos = new vscode.Position(gtags.line! - 1, 0);
            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos));
        });
    });
}

export function historyGtags(gtags: global.GlobalResult) {
    if (gtags.symbol === undefined)
        return;

    searchGtags(gtags.symbol);
    moveGtags(gtags);
}

export async function updateGtags() {
    let config = vscode.workspace.getConfiguration("gtags-help");
    let autoUpdate = config.get("autoUpdate", false);

    if (autoUpdate) {
        let globalCmd = global.getGlobalCmd();
        const path = vscode.window.activeTextEditor!.document.uri.fsPath;

        await execCmd(globalCmd + " --single-update " + path)
            .then(() => {
                vscode.window.showInformationMessage("Update Gtags done!");
            })
            .catch(() => {
                vscode.window.showErrorMessage("Update Gtags failed!");
            });
    }
}
