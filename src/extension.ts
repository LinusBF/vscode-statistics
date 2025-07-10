import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore from 'ignore';

export function activate(context: vscode.ExtensionContext) {
    // Create a status bar item (left-aligned with moderate priority) and show initial loading state
    const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusItem.text = '$(sync~spin) Indexing...';  // show spinner icon while indexing
    statusItem.tooltip = 'Scanning repository for code statistics...';
    statusItem.show();
    context.subscriptions.push(statusItem);

    // Create an output channel for detailed stats display
    const outputChannel = vscode.window.createOutputChannel('Repository Code Stats');
    context.subscriptions.push(outputChannel);

    // Register command to show detailed statistics in the output panel
    context.subscriptions.push(vscode.commands.registerCommand('codeStats.showDetails', () => {
        outputChannel.show(true);
    }));

    // Function to index all files in the workspace and compute stats
    const indexWorkspace = async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            statusItem.text = 'Repo Stats: (No folder open)';
            statusItem.tooltip = undefined;
            return;
        }

        // For simplicity, index the first workspace folder (assuming a single-root workspace)
        const rootUri = folders[0].uri;
        const rootPath = rootUri.fsPath;
        const ig = ignore();
        try {
            // Load .gitignore patterns if present
            const gitignorePath = path.join(rootPath, '.gitignore');
            const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
            ig.add(gitignoreContent);
        } catch (err) {
            // Ignore error if .gitignore not found or cannot be read
        }

        // Define known binary file extensions to skip
        const binaryExts = new Set([
            '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico',
            '.zip', '.tar', '.gz', '.rar', '.7z',
            '.exe', '.dll', '.so', '.bin', '.class', '.jar', 
            '.mp3', '.mp4', '.avi', '.pdf'
        ]);

        // Data structure to collect stats per file type
        interface FileTypeStats {
            fileCount: number;
            totalLines: number;
            totalSize: number;
            minLines: number;
            maxLines: number;
            minSize: number;
            maxSize: number;
        }
        const statsMap: Map<string, FileTypeStats> = new Map();
        let totalFiles = 0;
        let totalLines = 0;

        // Recursively scan a directory
        const scanDirectory = async (dirPath: string, relPath: string = ''): Promise<void> => {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const name = entry.name;
                const relativePath = relPath ? path.join(relPath, name) : name;
                // Skip hidden files and folders (names starting with '.')
                if (name.startsWith('.')) {
                    // (We already handled the root .gitignore separately, no need to index it)
                    continue;
                }
                // Skip anything matched by .gitignore patterns
                if (ig.ignores(relativePath + (entry.isDirectory() ? '/' : ''))) {
                    continue;
                }
                // Skip symbolic links entirely
                if (entry.isSymbolicLink()) {
                    continue;
                }
                if (entry.isDirectory()) {
                    // Recurse into subdirectory
                    const subdirPath = path.join(dirPath, name);
                    await scanDirectory(subdirPath, relativePath);
                } else if (entry.isFile()) {
                    const filePath = path.join(dirPath, name);
                    const ext = path.extname(name).toLowerCase() || '(no extension)';
                    // Skip known binary file types
                    if (binaryExts.has(ext)) {
                        continue;
                    }
                    // Get file size and basic info
                    let fileStat: fs.Stats;
                    try {
                        fileStat = await fs.promises.stat(filePath);
                    } catch (err) {
                        continue; // skip files that cannot be accessed
                    }
                    const fileSize = fileStat.size;
                    // Quick binary content check: look for null byte in first chunk
                    if (fileSize > 0) {
                        try {
                            const fd = await fs.promises.open(filePath, 'r');
                            const buffer = Buffer.alloc(Math.min(512, fileSize));
                            const { bytesRead } = await fd.read(buffer, 0, buffer.length, 0);
                            await fd.close();
                            // If any byte is 0x00, treat file as binary and skip
                            if (buffer.slice(0, bytesRead).includes(0)) {
                                continue;
                            }
                        } catch {
                            continue; // if file can't be read (permissions, etc.), skip
                        }
                    }
                    // Read file as a stream and count lines
                    let lineCount = 0;
                    let lastChunkEndedWithNewline = false;
                    let fileEmpty = true;
                    try {
                        await new Promise<void>((resolve, reject) => {
                            const stream = fs.createReadStream(filePath);
                            stream.on('data', (chunk: string | Buffer) => {
                                fileEmpty = false;
                                // Ensure we're working with a Buffer
                                const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                                for (let i = 0; i < buffer.length; i++) {
                                    if (buffer[i] === 0x0A) { // '\n'
                                        lineCount++;
                                    }
                                }
                                lastChunkEndedWithNewline = buffer[buffer.length - 1] === 0x0A;
                            });
                            stream.on('end', () => {
                                if (!fileEmpty && !lastChunkEndedWithNewline) {
                                    lineCount++; // count last line if not ending in newline
                                }
                                resolve();
                            });
                            stream.on('error', err => {
                                reject(err);
                            });
                        });
                    } catch {
                        // If there's an error reading the file stream, skip counting it
                        continue;
                    }
                    totalFiles++;
                    totalLines += lineCount;
                    // Update stats for this file's extension type
                    const stats = statsMap.get(ext) || {
                        fileCount: 0, totalLines: 0, totalSize: 0,
                        minLines: Infinity, maxLines: -Infinity,
                        minSize: Infinity, maxSize: -Infinity
                    };
                    stats.fileCount += 1;
                    stats.totalLines += lineCount;
                    stats.totalSize += fileSize;
                    if (lineCount < stats.minLines) stats.minLines = lineCount;
                    if (lineCount > stats.maxLines) stats.maxLines = lineCount;
                    if (fileSize < stats.minSize) stats.minSize = fileSize;
                    if (fileSize > stats.maxSize) stats.maxSize = fileSize;
                    statsMap.set(ext, stats);
                }
            }
        };

        // Start scanning from the workspace root
        await scanDirectory(rootPath, '');
        
        // Compute averages and prepare output
        let tooltipLines: string[] = [];
        tooltipLines.push(`**File Type Statistics** (in workspace: \`${path.basename(rootPath)}\`):`);
        tooltipLines.push('| Filetype | Files | Total LOC | Min LOC | Avg LOC | Max LOC | Min Size (B) | Avg Size (B) | Max Size (B) |');
        tooltipLines.push('|----------|------:|---------:|-------:|-------:|-------:|------------:|------------:|------------:|');
        // Sort file types alphabetically for output
        const fileTypes = Array.from(statsMap.keys()).sort();
        for (const ext of fileTypes) {
            const s = statsMap.get(ext)!;
            const avgLines = s.fileCount ? Math.round(s.totalLines / s.fileCount) : 0;
            const avgSize = s.fileCount ? Math.round(s.totalSize / s.fileCount) : 0;
            tooltipLines.push(`| \`${ext}\` | ${s.fileCount} | ${s.totalLines} | ${s.minLines} | ${avgLines} | ${s.maxLines} | ${s.minSize} | ${avgSize} | ${s.maxSize} |`);
        }
        // Update status bar to show summary and attach detailed tooltip
        statusItem.text = `$(check) Repo Stats: ${totalFiles} files, ${totalLines} lines`;
        statusItem.tooltip = new vscode.MarkdownString(tooltipLines.join('\n'));
        statusItem.tooltip.isTrusted = true;  // allow rendering of Markdown in tooltip
        statusItem.command = 'codeStats.showDetails';

        // Also output the detailed stats to the output channel
        outputChannel.clear();
        outputChannel.appendLine(`Repository Statistics for '${path.basename(rootPath)}':`);
        for (const ext of fileTypes) {
            const s = statsMap.get(ext)!;
            const avgLines = s.fileCount ? Math.round(s.totalLines / s.fileCount) : 0;
            const avgSize = s.fileCount ? Math.round(s.totalSize / s.fileCount) : 0;
            outputChannel.appendLine(`${ext} files: ${s.fileCount}`);
            outputChannel.appendLine(`  Lines of Code - total: ${s.totalLines}, min: ${s.minLines}, avg: ${avgLines}, max: ${s.maxLines}`);
            outputChannel.appendLine(`  File Size (bytes) - min: ${s.minSize}, avg: ${avgSize}, max: ${s.maxSize}`);
        }
        outputChannel.appendLine(`\nTotal: ${totalFiles} files, ${totalLines} lines of code`);
        outputChannel.appendLine(`(Hidden, binary, symlink, and .gitignore-ignored files were excluded.)`);
    };

    // Kick off the indexing asynchronously (do not block activate)
    indexWorkspace().catch(err => {
        console.error('Error indexing workspace:', err);
        statusItem.text = 'Repo Stats: Indexing failed';
        statusItem.tooltip = `${err}`;
    });
}

export function deactivate() {
    // Clean-up is handled via context.subscriptions; nothing else to do here.
}