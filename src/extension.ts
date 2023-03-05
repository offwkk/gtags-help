// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as global from "./global";
import { findDefinition, findReference, getWorkspaceRootPath } from './utils';

// let definitionList: global.Global[] = [];
let definitionList: global_result[] = [];
let referenceList: global_result[] = [];
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

	vscode.commands.registerCommand('gtags-help.find', findGlobal);
	vscode.commands.registerCommand("gtags-help.move", moveGlobal);

	async function findGlobal() {
		definitionList = [];
		referenceList = [];

		let definitionResult = await findDefinition();
		let referenceResult = await findReference();

		for (let i = 0; i < definitionResult.length; i++) {
			const item = new global_result(definitionResult[i].description,
				definitionResult[i].symbol, definitionResult[i].line,
				definitionResult[i].path);
			item.command = {
				command: "gtags-help.move",
				title: "move Global",
				arguments: [item]
			}
			definitionList.push(item);
		}

		for (let i = 0; i < referenceResult.length; i++) {
			const item = new global_result(referenceResult[i].description,
				referenceResult[i].symbol, referenceResult[i].line,
				referenceResult[i].path);
			item.command = {
				command: "gtags-help.move",
				title: "move Global",
				arguments: [item]
			}
			referenceList.push(item);
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

export class DefinitionProvider implements vscode.TreeDataProvider<global_result> {
	constructor() {}

	getTreeItem(element: global_result): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: global_result): vscode.ProviderResult<global_result[]> {
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

function moveGlobal(item: global_result) {
	if (item.symbol === undefined)
		return;

	let path = getWorkspaceRootPath();
	path += "/" + item.path;

	vscode.workspace.openTextDocument(path).then(document => {
		vscode.window.showTextDocument(document).then(editor => {
			var pos = new vscode.Position(item.line! - 1, 0);
			editor.selection = new vscode.Selection(pos, pos);
			editor.revealRange(new vscode.Range(pos, pos));
		});
	});
}

class global_result extends vscode.TreeItem {
	readonly symbol: string | undefined;
	readonly line: number | undefined;
	readonly path: string | undefined;

	constructor(label: string, symbol: string, line: number, path: string) {
		super(label);
		this.symbol = symbol;
		this.line = line;
		this.path = path;
	}
}
