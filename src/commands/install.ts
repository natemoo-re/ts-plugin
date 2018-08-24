import { Spinner } from 'cli-spinner';
import tc from 'turbocolor';

import { isInstalled, addToConfig} from '../project';
import { npm } from '../utils';



export async function installPlugin(pluginName: Promise<string>) {
    const name = await pluginName;
    
    // User cancelled the prompt (no worries)
    if (!name) return;
    
    // Plugin is already installed
    if (await isInstalled(name)) {
        console.log(`${tc.green('✔')} ${tc.bold('Found')} ${tc.green('"' + name + '"')} in project ${tc.dim('(already installed)')}`)
        return;
    }

    const loading = new Spinner(tc.bold(`Installing ${name}`));
    loading.setSpinnerString(18);
    loading.start();

    const cwd = process.cwd();

    try {
        await Promise.all([
            npm(`i --save-dev ${name}`, cwd),
            addToConfig(name)
        ]);

        loading.stop(true);
        
        console.log(`${tc.green('✔')} ${tc.bold('Installed')} plugin ${tc.green('"' + name + '"')}`)
    } catch (e) {
        
    }
    console.log(`

  ${tc.dim('Next steps:')}
  ${tc.dim('- Configure your editor to use the')} workspace version ${tc.dim('of TypeScript (https://git.io/fAtM0)')}
`);

}