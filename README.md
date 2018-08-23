# Typescript Plugin Manager
No more manually adding or removing TypeScript plugins from your `tsconfig.json` or `jsconfig.json` files!

## Usage
```
npx ts-plugin install [plugin-name]
npx ts-plugin uninstall [plugin-name]
```

## Features
- Gives users a single-line command to simplifies plugin installation
    - Adds plugin to `tsconfig.json` or `jsconfig.json`
    - Installs the plugin with NPM as a `devDependency`
- Beautiful, user-friendly CLI interface
- Automatic plugin name resolution from name shortcuts
    - `ts-plugin install styled` -> resolves and installs `typescript-styled-plugin`
    - `ts-plugin install stencil` -> resolves and installs `typescript-plugin-stencil`
    - Matches `typescript-plugin-*`, `typescript-*-plugin`, `ts-plugin-*`, `ts-*-plugin`
    - If multiple potential plugins are found, user is prompted to select one (sorted by popularity)

## Credits
Project structure built on [create-stencil](https://github.com/ionic-team/create-stencil)