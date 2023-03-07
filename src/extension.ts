// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as global from "./global";
import { moveGlobal, findDefinition, findReference, moveHistoryGlobal } from './utils';

// let definitionList: global.Global[] = [];
let definitionList: global.GlobalResult[] = [];
let referenceList: global.GlobalResult[] = [];
let historyList: global.GlobalResult[] = [];
let maxHistory: number;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const config = vscode.workspace.getConfiguration("gtags-help");
	maxHistory = config.get('maxHistory', 50);

	vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration("gtags-help.maxHistory");
		if (affected) {
			const config = vscode.workspace.getConfiguration("gtags-help");
			maxHistory = config.get('maxHistory', 50);
		}
	});

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
	vscode.commands.registerCommand('gtags-help.move', moveGlobal);
	vscode.commands.registerCommand('gtags-help.history', moveHistoryGlobal);

	context.subscriptions.push(disposable);
}

export async function findGlobal(historyResult?: string) {
	definitionList = [];
	referenceList = [];

	let definitionResult = await findDefinition(historyResult);
	let referenceResult = await findReference(historyResult);

	for (let i = 0; i < definitionResult.length; i++) {
		const item = new global.GlobalResult(definitionResult[i].description,
			definitionResult[i].symbol, definitionResult[i].line,
			definitionResult[i].path, 'gtags-help.move');
		definitionList.push(item);
	}

	for (let i = 0; i < referenceResult.length; i++) {
		const item = new global.GlobalResult(referenceResult[i].description,
			referenceResult[i].symbol, referenceResult[i].line,
			referenceResult[i].path, 'gtags-help.move');
		referenceList.push(item);
	}

	const item = new global.GlobalResult(definitionResult[0].symbol,
		definitionResult[0].symbol, definitionResult[0].line,
		definitionResult[0].path, 'gtags-help.history');

	if (historyList.find(history => history.label === definitionResult[0].symbol))
		historyList = historyList.filter(history => history.label !== definitionResult[0].symbol);
	historyList.push(item);

	if (maxHistory > 0) {
		historyList = historyList.reverse().slice(0, maxHistory).reverse();
	}

	createTreeView();
}

// This method is called when your extension is deactivated
export function deactivate() {}

export function createTreeView() {
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

export class DefinitionProvider implements vscode.TreeDataProvider<global.GlobalResult> {
	constructor() {}

	getTreeItem(element: global.GlobalResult): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: global.GlobalResult): vscode.ProviderResult<global.GlobalResult[]> {
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
