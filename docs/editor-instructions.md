# Enabling Typescript Plugins by Editor
After installing a Typescript Language Server Plugin, editors may require a number of different steps in order for the changes to take effect. Below are instructions for the most common editors. 

*If these instructions are out of date or missing your favorite ediotr, PRs are welcome!*

The following assumes that you have installed a version of TypeScript as a dependency in your project, and have successfully installed a plugin using `ts-plugin install [plugin-name]`.

## VS Code
Run the `Select TypeScript Version` command and select `Use Workspace Version`. 

If you are already using the Workspace Version of TypeScript, simply run the `Restart TS Server` command.

## Sublime

Ensure that you are using the **Sublime TypeScript** plugin.

Configure Sublime to use the workspace version of TypeScript by setting the typescript_tsdk setting in Sublime:
```
{ "typescript_tsdk": "/Users/path/to/my-project/node_modules/typescript/lib" }
```
Finally, restart Sublime for the changes to take effect.


## Atom
Ensure that you are using the **Atom TypeScript** plugin.

All you need to do is restart Atom, and Atom TypeScript will automatically use the workspace version of TypeScript.


## Visual Studio
*Note that `jsconfig.json` projects are currently not supported in VS.*

Ensure that you are using Visual Studio 2017 and the TypeScript 2.5+ SDK.

Reload your project to ensure that the plugin has loaded properly.

---

### Acknowledgements
This document has been adapted from Microsoft's [typescript-styled-plugin](https://github.com/Microsoft/typescript-styled-plugin/blob/master/README.md) documentation.