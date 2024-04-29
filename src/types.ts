import * as vscode from 'vscode';

export type Edition = {
  line: vscode.TextLine;
  lineText: string;
};

export type Sign = {
  sign: string;
  lang: string[];
};

export type BlockSign = {
  open: string;
  close: string;
  lang: string[];
};

export type SignStructure = {
  singleLine: Sign[];
  multiline: BlockSign[];
};
