# Repository Code Statistics VS Code Extension

A lightweight Visual Studio Code extension that automatically indexes your workspace on startup and displays code statistics per file type in the status bar.

## Features

* Counts **total lines of code (LOC)** per file type
* Shows **minimum, maximum, and average LOC** per file
* Shows **minimum, maximum, and average file size** (bytes)
* Excludes files matched by **`.gitignore`**, hidden files, symlinks, and common binary formats
* Runs automatically when a workspace opens—no manual trigger required
* Quick summary in the VS Code status bar, with a detailed tooltip and an **output panel** via the `Show Code Statistics` command

## Installation

### For Users

**Method 1: From GitHub Releases (Recommended)**
1. Go to the [Releases page](../../releases)
2. Download the latest `.vsix` file
3. In VS Code, go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

**Method 2: From VS Code Marketplace (if published)**
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Repository Code Statistics"
4. Click Install

### For Developers

1. **Clone** the repository.
2. Run `npm install` to install dependencies.
3. **Build** the extension:

   ```bash
   npm run compile
   ```
4. **Launch** for testing:

   ```bash
   code .
   ```

   Press **F5** to open a new Extension Development Host.

### Creating Releases

See [RELEASE_GUIDE.md](RELEASE_GUIDE.md) for detailed instructions on creating releases.

## Usage

Open any workspace folder. After the initial scan, the status bar displays something like:

```
Repo Stats: 128 files, 42 367 lines
```

* **Hover** the item for a Markdown table with detailed per‑type stats.
* **Click** the item or run **`Show Code Statistics`** from the Command Palette to open the full report in an output panel.

## Development Notes

* Source TypeScript lives in `src/`; compiled JavaScript in `out/`.
* Update metadata in `package.json` before publishing.
* Pull requests are welcome!

## License

MIT
