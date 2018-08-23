import { Spinner } from 'cli-spinner';
import tc from 'turbocolor';

import { isInstalled, removeFromConfig } from './project';
import { npm } from './utils';



export async function uninstallPlugin(pluginName: Promise<string>) {
    const name = await pluginName;

    // User cancelled the prompt (no worries)
    if (!name) return;

    // Plugin is already installed
    if (!(await isInstalled(name))) return;

    const loading = new Spinner(tc.bold(`Uninstalling ${name}`));
    loading.setSpinnerString(18);
    loading.start();

    const cwd = process.cwd();

    try {
        await Promise.all([
            npm(`i uninstall ${name}`, cwd),
            removeFromConfig(name)
        ]);

        loading.stop(true);

        console.log(`${tc.green('✔')} ${tc.bold('Uninstalled')} plugin ${tc.green('"' + name + '"')}`)
    } catch (e) {
        throw new Error(e);
    }

}