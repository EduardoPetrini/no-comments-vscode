// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commentSigns } from './commentsSigns';
import { Edition } from './types';
import { Stats } from './Stats';
import { isSingleLineComment } from './comments';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "no-comments" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const stats = new Stats();

  const editLine = async (oldLine: vscode.TextLine, newLineText: string, editor: vscode.TextEditor) => {
    return new Promise((resolve, reject) => {
      editor.edit(edit => {
        if (!newLineText || !newLineText.trim()) {
          stats.addDeleted();
          return resolve(edit.delete(oldLine.rangeIncludingLineBreak));
        }
        stats.addUpdated();
        return resolve(edit.replace(oldLine.range, newLineText));
      });
    });
  };

  const editLines = async (editions: Edition[], activeTextEditor: vscode.TextEditor) => {
    for (let edition of editions) {
      await editLine(edition.line, edition.lineText, activeTextEditor);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  let disposable = vscode.commands.registerCommand('no-comments.removeComments', async () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Checking and removing comments...');

    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      return;
    }

    const document = activeTextEditor.document;

    let openCommentChanges: Edition[] = [];
    let isMultilineComment = false;
    let openCommentSign = '';
    let hasChanged = false;
    for (let lineIndex = document.lineCount - 1; lineIndex >= 0; lineIndex--) {
      const line = document.lineAt(lineIndex);
      let lineChanged = false;
      let lineText = line.text;

      if (isMultilineComment) {
        if (!lineText.includes(openCommentSign)) {
          openCommentChanges.push({ line, lineText: '' });
          continue;
        }
        lineText = lineText.split(openCommentSign)[0].trimEnd();
        openCommentChanges.push({ line, lineText });

        await editLines(openCommentChanges, activeTextEditor);
        isMultilineComment = false;
        openCommentChanges = [];
        hasChanged = true;
      }

      for (let singleLineSign of commentSigns.singleLine) {
        if (!isSingleLineComment(lineText, singleLineSign)) {
          continue;
        }

        lineText = lineText.split(singleLineSign)[0].trimEnd();
        lineChanged = true;
      }

      for (let multiLineSign of commentSigns.multiline) {
        if (!lineText.includes(multiLineSign.close)) {
          continue;
        }

        if (!lineText.includes(multiLineSign.open)) {
          const endIndex = lineText.indexOf(multiLineSign.close) + multiLineSign.close.length;
          lineText = lineText.slice(endIndex).trimStart();
          openCommentChanges.push({ line, lineText });
          isMultilineComment = true;
          openCommentSign = multiLineSign.open;
          break;
        }

        const start = lineText.indexOf(multiLineSign.open);
        if (lineText.includes(multiLineSign.close)) {
          const end = lineText.indexOf(multiLineSign.close) + multiLineSign.close.length;

          const beforeComment = lineText.slice(0, start);
          const afterComment = lineText.slice(end);
          lineText = beforeComment + afterComment;
          lineChanged = true;
          continue;
        }
      }

      if (!lineChanged) {
        continue;
      }

      hasChanged = true;
      await editLines([{ line, lineText }], activeTextEditor);
    }

    await activeTextEditor.document.save();

    const userInfoMessage = stats.getStatsMessage();
    vscode.window.showInformationMessage(userInfoMessage);
    stats.reset();
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

