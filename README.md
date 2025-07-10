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

1. **Clone** the repository.
2. Run `npm install` to install dependencies.
3. **Build** the extension:

   ```bash
   npx tsc
   ```
4. **Launch** for testing:

   ```bash
   code .
   ```

   Press **F5** to open a new Extension Development Host.

### Package for the Marketplace

```bash
npm install -g vsce
vsce package
```

Upload the generated `.vsix` file to the Marketplace or install locally:

```bash
code --install-extension repo-code-stats-*.vsix
```

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
