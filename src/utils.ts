import * as vscode from "vscode";
import * as global from "./global";
import { exec, ExecException } from "child_process";

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

export function parseResult(result: string): Array<{symbol: string, line: number, path: string } | undefined>  {
    const lines = result.trimEnd().split('\n');

    return lines.map((line: string) => {
        if (line == null)
            return;

        let groups = line.split(/ +/);
        return { "symbol": groups[0], "line": Number(groups[1]), "path": groups[2]};
    });

}

export async function findGlobal(position: vscode.Position) {
    let globalCmd = global.getGlobal();
    let definitionGlobal: global.Global[] = [];
    let referenceGlobal: global.Global[] = [];

    const editor = vscode.window.activeTextEditor!;

    position = editor.selection.active;
    let wordRange = editor.document.getWordRangeAtPosition(position, /\S+/);
    let word = editor.document.getText(wordRange)
    word = word.substring(0, word.indexOf('('));

    let definitionResult = parseResult(await execCmd(globalCmd + " -dx " + word));
    let referenceResult = parseResult(await execCmd(globalCmd + " -rx " + word));

    for (let i = 0; i < definitionResult.length; i++) {
        definitionGlobal[i] = new global.Global(
            definitionResult[i]?.symbol!, definitionResult[i]?.line!, definitionResult[i]?.path!);

        console.log(definitionGlobal[i]);
    }

    for (let i = 0; i < referenceResult.length; i++) {
        referenceGlobal[i] = new global.Global(
            referenceResult[i]?.symbol!, referenceResult[i]?.line!, referenceResult[i]?.path!);

        console.log(referenceGlobal[i]);
    }
}
