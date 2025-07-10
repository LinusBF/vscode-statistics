# Release Guide

This guide explains how to create releases for the VS Code Extension.

## Automatic Releases

The repository is set up with GitHub Actions workflows that automatically build and release the extension when you create a git tag.

### Creating a Release

1. **Update the version** in `package.json`:
   ```bash
   # Update the version field manually, or use npm version
   npm version patch  # for patch updates (1.0.0 -> 1.0.1)
   npm version minor  # for minor updates (1.0.0 -> 1.1.0)
   npm version major  # for major updates (1.0.0 -> 2.0.0)
   ```

2. **Create and push a git tag**:
   ```bash
   git tag v1.0.0  # Replace with your version
   git push origin v1.0.0
   ```

3. **GitHub Actions will automatically**:
   - Build the extension
   - Package it into a `.vsix` file
   - Create a GitHub release
   - Attach the `.vsix` file to the release

### Manual Release (if needed)

If you need to create a release manually:

1. **Build the extension**:
   ```bash
   npm install
   npm run compile
   ```

2. **Package the extension**:
   ```bash
   npx @vscode/vsce package
   ```

3. **Create a GitHub release** and upload the `.vsix` file manually.

## Installation for Users

Users can install the extension in several ways:

### Method 1: From GitHub Releases (Recommended)
1. Go to the [Releases page](../../releases)
2. Download the latest `.vsix` file
3. In VS Code, go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Method 2: From VS Code Marketplace (if published)
1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for "Repository Code Statistics"
4. Click Install

## Continuous Integration

The repository includes two workflows:

- **Build workflow** (`.github/workflows/build.yml`): Runs on every push and pull request to test the extension
- **Release workflow** (`.github/workflows/release.yml`): Runs when a version tag is pushed to create releases

## Publishing to VS Code Marketplace (Optional)

If you want to publish to the official VS Code Marketplace:

1. **Get a Personal Access Token** from Azure DevOps
2. **Add the token as a repository secret** named `VSCE_PAT`
3. **Update the release workflow** to include publishing:
   ```yaml
   - name: Publish to VS Code Marketplace
     run: vsce publish -p ${{ secrets.VSCE_PAT }}
   ```

For more details, see the [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension). 