import * as vscode from 'vscode';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.newPackage', async (uri: vscode.Uri) => {
        try {
            // Falls kein Ziel gewählt wurde → Arbeitsbereich
            let targetDir: string;
            if (uri && uri.fsPath) {
                targetDir = uri.fsPath;
            } else if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
                targetDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
            } else {
                vscode.window.showErrorMessage('No workspace folder open.');
                return;
            }

            // Ordnername erfragen
            const folderName = await vscode.window.showInputBox({
                prompt: 'Enter the new package name',
                placeHolder: 'my_package'
            });

            if (!folderName) {
                return;
            }

            const packagePath = join(targetDir, folderName);

            // Ordner anlegen
            await mkdir(packagePath, { recursive: true });

            // index.ts anlegen
            const indexFilePath = join(packagePath, 'index.ts');
            await writeFile(indexFilePath, 'export {}', { encoding: 'utf8' });

            // Datei im Editor öffnen
            const doc = await vscode.workspace.openTextDocument(indexFilePath);
            await vscode.window.showTextDocument(doc);

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create package: ${String(error)}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
