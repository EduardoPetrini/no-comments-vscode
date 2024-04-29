import * as vscode from 'vscode';
import { commentSigns } from './commentsSigns';
import { Edition } from './types';
import { Stats } from './Stats';
import { isSingleLineComment } from './comments';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "no-comments" is now active!');

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
    vscode.window.showInformationMessage('Checking and removing comments...');

    const activeTextEditor = vscode.window.activeTextEditor;

    if (!activeTextEditor) {
      return;
    }

    const { document } = activeTextEditor;
    const { languageId } = document;

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
        if (!isSingleLineComment(lineText, singleLineSign, languageId)) {
          continue;
        }

        const { sign } = singleLineSign;

        lineText = lineText.split(sign)[0].trimEnd();
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

    if (hasChanged) {
      await activeTextEditor.document.save();
    }

    const userInfoMessage = stats.getStatsMessage();
    vscode.window.showInformationMessage(userInfoMessage);
    stats.reset();
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

