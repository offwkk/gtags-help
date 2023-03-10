import * as vscode from "vscode";
import * as utils from "./utils"

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
        return `${utils.getWorkspaceRootPath()}/${this.filePath}`;
    }

    public get description(): string {
        return `${this.path}: ${this.line}`;
    }
}

export class GlobalResult extends vscode.TreeItem {
	readonly symbol: string | undefined;
	readonly line: number | undefined;
	readonly path: string | undefined;

	constructor(label: string, symbol: string, line: number,
				path: string, command: string) {
		super(label);
		this.symbol = symbol;
		this.line = line;
		this.path = path;
		this.command = {
			command: command,
			title: command + ".onClick",
			arguments: [this]
		}
	}

	public get fullPath(): string {
        return `${utils.getWorkspaceRootPath()}/${this.path}`;
    }

	public get summary(): string {
        return `${this.path}: ${this.line}`;
    }
}
