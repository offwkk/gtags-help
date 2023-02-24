import * as vscode from "vscode";
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

export function parseResult(result: string): any {
    if (result == null || result == "")
        return null;

    const lines = result.split(/ +/);
    const reg = /\r?\n/;

    return lines.map((line: string) => {
        let groups = reg.exec(line);
        if (groups !== null) {
            return { "symbol": groups[1], "line": groups[2], "path": groups[3]};
        }
    });
}

export async function findGlobal(document: vscode.TextDocument, position: vscode.Position) {
    let global: Global[];
    const target = document.getWordRangeAtPosition(position);
    let definitionResult = parseResult(await execCmd('${globalCmd -dx ${symbol}'));
    let referenceResult = parseResult(await execCmd('${globalCmd} -rx ${symbol}'));
}
