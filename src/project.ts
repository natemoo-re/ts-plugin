import * as fs from 'fs';
import { promisify } from 'util';
import { toShortName } from './utils';

const readdir = promisify(fs.readdir);
const readfile = promisify(fs.readFile);
const writefile = promisify(fs.writeFile);
let dir: string[] = [];
let file: string;
let installed: string[] = [];

export async function scanProject() {
    await isTsProject();
    return getInstalledPlugins();
}

async function getConfigForPlugin(pluginName: string): Promise<{ name: string, [key: string]: unknown }> {
    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));
    
    if (config && config.compilerOptions && config.compilerOptions.plugins && config.compilerOptions.plugins.length) {
        const plugins = config.compilerOptions.plugins as { name: string, [key: string]: unknown }[];
        return plugins.filter(p => p.name === pluginName).pop() as { name: string, [key: string]: unknown };
    } else {
        return { name: pluginName };
    }
}

// TODO handle strings delimited by periods as nested objects
async function setConfigForPlugin(newConfig: { name: string, [key: string]: unknown }) {
    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));

    const pluginName = newConfig.name;
    const plugins = [...(config.compilerOptions.plugins || []).map((p: { name: string}) => (p.name === pluginName) ? newConfig : p)];
    const compilerOptions = Object.assign({}, config.compilerOptions, { plugins });
    const value = Object.assign({}, config, { compilerOptions });
    return writefile(file, JSON.stringify(value, null, 2));
}

export async function isInstalled(pluginName: string): Promise<boolean> {
    await getInstalledPlugins();
    return (installed.includes(pluginName));
}

export async function addValueToConfig(pluginName: string, key: string, value: any) {
    if (!file) return;

    const config = await getConfigForPlugin(pluginName);
    const newConfig = Object.assign({}, config, { [key]: value });

    return setConfigForPlugin(newConfig);
}

export async function getValuesFromConfig(pluginName?: string) {
    if (!file) return;

    if (pluginName) {
        const { name, ...config } = await getConfigForPlugin(pluginName);
        if (config) return Promise.resolve(config);
    }
    // TODO get whole configured values if no name
    // else {
    //     if (installed) {
    //         const plugins = await Promise.all(installed.map(getConfigForPlugin))
    //         const map = new Map<string, any>();
    //         plugins.forEach(({ name, ...config }) => {
    //             map.set(name, config);
    //         })
    //         return Promise.resolve();
    //     }
    // }

    throw new Error(`Configuration does not exist for plugin "${pluginName}"`);
}

export async function getValueFromConfig(pluginName: string, key: string) {
    if (!file) return;

    const { name, ...config } = await getConfigForPlugin(pluginName);
    if (config && config[key]) return Promise.resolve(config[key]);

    throw new Error(`Configuration key "${key}" does not exist for plugin "${pluginName}"`);
}

export async function deleteValueFromConfig(pluginName: string, key: string) {
    if (!file) return;
    if (key === 'name') throw new Error(`Unable to delete "name" from configuration. To uninstall this plugin, instead try:

  ts-plugin uninstall ${toShortName(pluginName)}`)

    const { [key]: omit, ...config} = await getConfigForPlugin(pluginName);
    return setConfigForPlugin(config);
}

export async function addPluginToConfig(pluginName: string) {
    if (!file) return;

    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));

    if (config && !config.compilerOptions) {
        const value = Object.assign({}, config, { compilerOptions: { plugins: [{ name: pluginName }] } });
        return writefile(file, JSON.stringify(value, null, 2));
    } else if (config && config.compilerOptions) {
        const plugins = [...(config.compilerOptions.plugins || []), { name: pluginName }];
        const compilerOptions = Object.assign({}, config.compilerOptions, { plugins });
        const value = Object.assign({}, config, { compilerOptions });
        return writefile(file, JSON.stringify(value, null, 2));
    }
}

export async function removePluginFromConfig(pluginName: string) {
    if (!file) return;

    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));

    if (config && !config.compilerOptions) return;
    if (config && config.compilerOptions && !config.compilerOptions.plugins) return;
    
    const plugins = [...(config.compilerOptions.plugins).filter((p: {name: string}) => p.name !== pluginName)];
    const compilerOptions = Object.assign({}, config.compilerOptions, { plugins });
    const value = Object.assign({}, config, { compilerOptions });
    return writefile(file, JSON.stringify(value, null, 2));
}

export async function getInstalledPlugins() {
    if (!file) return;
    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));
    
    if (config && config.compilerOptions) {
        if (config.compilerOptions.plugins) installed = config.compilerOptions.plugins.map((x: any) => x.name);
        return Promise.resolve(installed);
    }
    throw new Error(`TypeScript config file is missing "compilerOptions".`)
}

async function isTsProject() {
    const [hasTS, hasJS] = await Promise.all([hasFile('tsconfig.json'), hasFile('jsconfig.json')]);

    if (hasTS) file = 'tsconfig.json';
    if (hasJS) file = 'jsconfig.json';

    if (hasTS || hasJS) return true;

    throw new Error(`Project does not appear to be a TypeScript project. 
  Please make sure you have a "tsconfig.json" or "jsconfig.json" file and try again.`)
}

async function getFiles(dirPath: string): Promise<string[]> {
    if (dir.length) {
        return dir;
    } else {
        dir.push(...await readdir(dirPath));
        return dir;
    }
}

async function hasFile(file: string): Promise<boolean> {
    const files = await getFiles(process.cwd());
    return files.includes(file);
}