import * as vscode from 'vscode';
import * as global from "./global";

export class DefinitionProvider implements vscode.TreeDataProvider<global.GlobalResult> {
	definitionList: global.GlobalResult[];

	constructor(defGtags: global.GlobalResult[]) {
		this.definitionList = defGtags;
	}

	getTreeItem(element: global.GlobalResult): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: global.GlobalResult): vscode.ProviderResult<global.GlobalResult[]> {
		return Promise.resolve(this.definitionList);
	}
}

export class ReferenceProvider implements vscode.TreeDataProvider<global.GlobalResult> {
	referenceList: global.GlobalResult[];

	constructor(refGtags: global.GlobalResult[]) {
		this.referenceList = refGtags;
	}

	getTreeItem(element: global.GlobalResult): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: global.GlobalResult): vscode.ProviderResult<global.GlobalResult[]> {
		return Promise.resolve(this.referenceList);
	}
}

export class HistoryProvider implements vscode.TreeDataProvider<global.GlobalResult> {
    historyList: global.GlobalResult[];

	constructor(history : global.GlobalResult[]) {
        this.historyList = history;
    }

	getTreeItem(element: global.GlobalResult): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: global.GlobalResult): vscode.ProviderResult<global.GlobalResult[]> {
		return Promise.resolve(this.historyList.reverse());
	}
}