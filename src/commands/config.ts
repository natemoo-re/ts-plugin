import tc from 'turbocolor';
import { resolveInstalledPluginName } from '../resolve-plugin';
import {
    getInstalledPlugins,
    addValueToConfig,
    getValuesFromConfig,
    getValueFromConfig,
    deleteValueFromConfig
} from '../project';
/// @ts-ignore
import prompts from 'prompts';

const SUBCOMMANDS = new Map<string|string[], boolean>([
    ['set', true],
    ['get', true],
    ['delete', true],
    ['list', false],
    ['-l', false],
    ['edit', false]
]);

export function isValidSubcommand(command: string) {
    return SUBCOMMANDS.has(command);
}

function requiresPlugin(command: string) {
    return SUBCOMMANDS.get(command);
}

function convertValue(value: string): any {
    if ((value === 'true') || (value === 'false')) return (value === 'true');
    else if (!Number.isNaN(Number(value))) return Number.parseInt(value);
    else if (value.trim().startsWith('[') && value.trim().endsWith(']')) return convertValue(value.replace(/[\[\]]/g, '') + ',');
    else if ((value.indexOf(',') > -1)) return value.split(',').map(x => convertValue(x.trim())).filter(x => x);
    else return value;
}

async function promptUserForPlugin(): Promise<string|undefined> {
    const plugins = await getInstalledPlugins();
    if (plugins) {
        const plugin = await prompts({
            type: 'select',
            name: 'plugin',
            message: `Which plugin do you want to configure?`,
            initial: 0,
            choices: plugins.map((title) => ({ value: title, title }))
        });
        return (plugin) ? (plugin as any).plugin : undefined;
    }
}

export async function configurePlugin(command: string, plugin: string | null | undefined, ...args: string[]) {
    if (!isValidSubcommand(command)) return;

    if (requiresPlugin(command)) {
        if (plugin) {
            plugin = await resolveInstalledPluginName(plugin);
        } else {
            const plugins = await getInstalledPlugins();
            if (plugins && plugins.length === 1) plugin = plugins[0];
        }
    }
        
    switch (command) {
        case 'set': {
            let [key, value, ...rest] = args as [string, any];
            if (!key) throw new Error(`ts-plugin config set <key> <value>`);
            value = (!value) ? true : convertValue(value);

            if (!plugin) plugin = await promptUserForPlugin();
                
            if (rest.length > 0) {
                value = [ value, ...rest.map(convertValue) ]
            }

            if (plugin) {
                await addValueToConfig(plugin!, key, value);
                console.log(`Updated ${tc.green(plugin!)} config`);
            }
            break;
        }
        case 'get': {
            let [key] = args;
            const value = await getValueFromConfig(plugin!, key);
            console.log(`${tc.magenta(key)} = ${value}`);
            break;
        }
        case 'delete': {
            // TODO be more intelligent, we can probably infer the plugin without having the user select it
            let [key] = args;
            const result = await deleteValueFromConfig(plugin!, key);
            console.log(`Deleted ${tc.red(key)} from ${tc.green(plugin!)} config`);
            break;
        }
        case 'list': 
        case '-l': {
            console.log(`listing config for ${plugin}`);
            const values = await getValuesFromConfig(plugin!);
            console.dir(values);
            break;
        }
        case 'edit': {
            console.log(`opening tsconfig|jsconfig`);
            break;
        }
    }
    // const name = await pluginName;
    // console.log(`config "${command}"`);
    // console.log(args);
}