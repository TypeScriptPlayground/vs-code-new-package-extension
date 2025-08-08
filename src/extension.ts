import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('new-package-extension.createPackage', async (uri: vscode.Uri) => {
    // Get the folder path where the context menu was triggered
    const folderPath = uri.fsPath;

    // Prompt user for the new package folder name
    const folderName = await vscode.window.showInputBox({
      prompt: 'Enter the name of the new package folder',
      placeHolder: 'Package name'
    });

    if (!folderName) {
      vscode.window.showErrorMessage('No folder name provided.');
      return;
    }

    // Create the full path for the new folder
    const newFolderPath = path.join(folderPath, folderName);

    try {
      // Create the new folder
      await fs.promises.mkdir(newFolderPath, { recursive: true });

      // Create the index.ts file inside the new folder
      const indexFilePath = path.join(newFolderPath, 'index.ts');
      await fs.promises.writeFile(indexFilePath, '// Index file for the package\n');

      vscode.window.showInformationMessage(`Package '${folderName}' created successfully with index.ts`);
    } catch (error: any) {
      vscode.window.showErrorMessage(`Failed to create package: ${error.message}`);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
