import * as vscode from "vscode";
import * as Utils from "./utils"


let globalCmd = "global";

export function getGlobal(): string {
    return globalCmd;
}

export class Global {
    readonly symbol: string;
    readonly line: number;
    readonly path: string;

    constructor(symbol: string, line: number, path: string) {
        this.symbol = symbol;
        this.line = line;
        this.path = path;
    }

    public get filePath(): string {
        return this.filePath.split('/').slice(-1)[0];
    }

    public get fullFilePath(): string {
        return `${Utils.getWorkspaceRootPath()}/${this.filePath}`;
    }

    public get description(): string {
        return `${this.path}: ${this.line}`;
    }
}
