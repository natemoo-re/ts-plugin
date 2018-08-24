import tc from 'turbocolor';
import { getInstalledPlugins } from '../project';

export async function listPlugins() {
    const plugins = await getInstalledPlugins();
    if (plugins && plugins.length) {
        plugins.forEach(plugin => console.log(`${plugin}\n`));
    } else {
        console.log('No plugins currently installed.')
    }
}