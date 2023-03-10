import * as vscode from 'vscode';
import * as global from "./global";
import * as provider from "./provider";
import * as utils from './utils';

let historyList: global.GlobalResult[] = [];
let maxHistory: number;

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

	console.log('Congratulations, your extension "gtags-help" is now active!');

	vscode.commands.registerCommand('gtags-help.search', searchGtags);
	vscode.commands.registerCommand('gtags-help.move', utils.moveGtags);
	vscode.commands.registerCommand('gtags-help.history', utils.historyGtags);
}

export async function searchGtags(historyResult?: string) {
	let definitionList: global.GlobalResult[] = [];
	let referenceList: global.GlobalResult[] = [];

	let definitionResult = await utils.findDefinition(historyResult);
	let referenceResult = await utils.findReference(historyResult);

	for (let i = 0; i < definitionResult.length; i++) {
		const item = new global.GlobalResult(definitionResult[i].description,
			definitionResult[i].symbol, definitionResult[i].line,
			definitionResult[i].path, 'gtags-help.move');
		definitionList.push(item);
	}

	vscode.window.createTreeView('result.definition', {
		treeDataProvider: new provider.DefinitionProvider(definitionList)
	});

	for (let i = 0; i < referenceResult.length; i++) {
		const item = new global.GlobalResult(referenceResult[i].description,
			referenceResult[i].symbol, referenceResult[i].line,
			referenceResult[i].path, 'gtags-help.move');
		referenceList.push(item);
	}

	vscode.window.createTreeView('result.reference', {
		treeDataProvider: new provider.ReferenceProvider(referenceList)
	});

	const item = new global.GlobalResult(definitionResult[0].symbol,
		definitionResult[0].symbol, definitionResult[0].line,
		definitionResult[0].path, 'gtags-help.history');

	if (historyList.find(history => history.label === definitionResult[0].symbol))
		historyList = historyList.filter(history => history.label !== definitionResult[0].symbol);
	historyList.push(item);

	if (maxHistory > 0) {
		historyList = historyList.reverse().slice(0, maxHistory).reverse();
	}

	vscode.window.createTreeView('result.history', {
		treeDataProvider: new provider.HistoryProvider(historyList)
	});
}

export function deactivate() {}
