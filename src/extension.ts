import * as vscode from 'vscode';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('newPackage');
  const fileNameSetting = config.get<string>('fileName', 'index.ts');
  const fileContentTemplate = config.get<string>('fileContent', '');

  const provider = vscode.window.registerFileDecorationProvider({
    provideFileDecoration(uri) {
      if (basename(uri.fsPath) === fileNameSetting) {
        return {
          badge: "_", // du kannst hier auch "★" oder "·" verwenden
          tooltip: "Entrypoint (index.ts)",
          color: new vscode.ThemeColor("charts.blue"),
        };
      }
      return undefined;
    }
  });

  const disposable = vscode.commands.registerCommand('extension.newPackage', async (uri: vscode.Uri) => {
    let targetDir: string;
    if (uri && uri.fsPath) {
      targetDir = uri.fsPath;
    } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
      targetDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }

    const folderName = await vscode.window.showInputBox({
      prompt: 'Enter the new package name',
      placeHolder: 'my_package'
    });

    if (!folderName) {
      return;
    }

    

    const packagePath = join(targetDir, folderName);

    try {
      await mkdir(packagePath, { recursive: true });
    } catch (error) {
      vscode.window.showErrorMessage('Failed to create directory:\n${String(error)}`);');
      return;
    }

    const fileContent = fileContentTemplate
      .replace(/\$\{fileName\}/g, fileNameSetting)
      .replace(/\$\{packageName\}/g, folderName);
      
    const filePath = join(packagePath, fileNameSetting);
    
    try {
      await writeFile(filePath, fileContent, { encoding: 'utf8' });
    } catch (error) {
      vscode.window.showErrorMessage('Failed to create file:\n${String(error)}`);');
      return;
    }

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);
  });

  context.subscriptions.push(provider);
  context.subscriptions.push(disposable);
}

export function deactivate() {}
