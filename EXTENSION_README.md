# Repository Code Statistics Extension

A Visual Studio Code extension that automatically analyzes your workspace and provides comprehensive code statistics.

## Features

- **Automatic Indexing**: Automatically scans your workspace when opened
- **File Type Analysis**: Breaks down statistics by file extension
- **Line Count Analysis**: Shows total, minimum, average, and maximum lines per file type
- **File Size Analysis**: Shows file size statistics (bytes) per file type
- **Smart Filtering**: Excludes binary files, hidden files, symlinks, and .gitignore patterns
- **Status Bar Integration**: Shows summary in the status bar with detailed tooltip
- **Output Panel**: Detailed statistics available in the output panel

## Usage

1. Open any workspace folder in VS Code
2. The extension will automatically start indexing (shown with a spinner in the status bar)
3. Once complete, the status bar will show a summary like "Repo Stats: 15 files, 1,234 lines"
4. Hover over the status bar item to see a detailed markdown table with statistics per file type
5. Click the status bar item to open the output panel with comprehensive statistics

## What's Excluded

- Hidden files and directories (starting with '.')
- Binary files (images, archives, executables, etc.)
- Symbolic links
- Files and directories matched by .gitignore patterns

## Development

To work on this extension:

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press F5 to open a new Extension Development Host window
5. Open a workspace folder to test the extension

## License

MIT License