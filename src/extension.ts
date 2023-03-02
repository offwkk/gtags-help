// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commands, ExtensionContext, TreeItem, TreeItemCollapsibleState, window } from 'vscode';
import * as global from "./global";
import { findDefinition, findReference } from './utils';

let definitionList: global.Global[] = [];
let referenceList: global.Global[] = [];
let historyList: global.Global[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "gtags-help" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('gtags-help.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from gtags-help!');
	});

	commands.registerCommand('gtags-help.definition', findGlobal);

	async function findGlobal() {
		definitionList = [];
		referenceList = [];

		let definitionResult = await findDefinition();
		let referenceResult = await findReference();

		for (let i = 0; i < definitionResult.length; i++) {
			definitionList.push(definitionResult[i]);
		}

		for (let i = 0; i < referenceResult.length; i++) {
			referenceList.push(referenceResult[i]);
		}

		createTreeView();
	}

	context.subscriptions.push(disposable);

	function createTreeView() {
		vscode.window.createTreeView('result.definition', {
			treeDataProvider: new DefinitionProvider()
		});

		vscode.window.createTreeView('result.reference', {
			treeDataProvider: new ReferenceProvider()
		});

		vscode.window.createTreeView('result.history', {
			treeDataProvider: new HistoryProvider()
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}

export class DefinitionProvider implements vscode.TreeDataProvider<global.Global> {
	constructor() {}

	getTreeItem(element: global.Global): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: any): vscode.ProviderResult<global.Global[]> {
		const definition = Object.assign([], definitionList);
		return Promise.resolve(definition);
	}
}

export class ReferenceProvider implements vscode.TreeDataProvider<global.Global> {
	constructor() {}

	getTreeItem(element: global.Global): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: any): vscode.ProviderResult<global.Global[]> {
		const reference = Object.assign([], referenceList);
		return Promise.resolve(reference);
	}
}

export class HistoryProvider implements vscode.TreeDataProvider<global.Global> {
	constructor() {}

	getTreeItem(element: global.Global): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: any): vscode.ProviderResult<global.Global[]> {
		const history = Object.assign([], historyList);
		return Promise.resolve(history.reverse());
	}
}
