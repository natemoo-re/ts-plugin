import * as fs from 'fs';
import { promisify } from 'util';

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

export async function isInstalled(pluginName: string): Promise<boolean> {
    await getInstalledPlugins();
    return (installed.includes(pluginName));
}

export async function addToConfig(pluginName: string) {
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

export async function removeFromConfig(pluginName: string) {
    if (!file) return;

    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));

    if (config && !config.compilerOptions) return;
    if (config && config.compilerOptions && !config.compilerOptions.plugins) return;
    
    const plugins = [...(config.compilerOptions.plugins).filter((p: {name: string}) => p.name !== pluginName)];
    const compilerOptions = Object.assign({}, config.compilerOptions, { plugins });
    const value = Object.assign({}, config, { compilerOptions });
    return writefile(file, JSON.stringify(value, null, 2));
}

async function getInstalledPlugins() {
    if (!file) return;
    const config = await readfile(file).then(buffer => JSON.parse(buffer.toString()));
    
    if (config && config.compilerOptions) {
        if (config.compilerOptions.plugins) installed = config.compilerOptions.plugins.map((x: any) => x.name);
        return Promise.resolve();
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