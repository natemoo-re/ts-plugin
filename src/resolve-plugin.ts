import tc from 'turbocolor';
/// @ts-ignore
import prompts from 'prompts';
import { exists, downloads, formatNumber } from './utils';

export async function resolvePluginName(pluginName: string): Promise<string> {
    if ((pluginName.indexOf('typescript') > -1 || pluginName.indexOf('ts') > -1) && pluginName.indexOf('plugin') > -1) {
        if (await exists(pluginName)) return pluginName;
        throw new Error(`TypeScript plugin ${tc.green('"' + pluginName + '"')} does not exist`);
    }

    const variations = [
        'typescript-plugin-*',
        'typescript-*-plugin',
        'ts-plugin-*',
        'ts-*-plugin'
    ].map(x => x.replace('*', pluginName))
    
    const result = await Promise.all(variations.map(exists));
    
    if (result.filter(x => x).length > 1) {
        console.log(`${tc.yellow('⚠')} Multiple plugins could match ${tc.green('"' + pluginName + '"')}`);

        const packages = result
            .map((value, i) => ({ value, i }))
            .filter(x => x.value)
            .map(async (x) => {
                const title = variations[x.i];
                const stats = await downloads(title);
                return { title, stats };
            });
        const choices = (await Promise.all(packages))
            .sort((a, b) => (a.stats < b.stats) ? 1 : -1)
            .map(({ title, stats }: { title: string, stats: number}) => {
                return {
                    title: `${title} ${tc.dim('(' + formatNumber(stats) + ' weekly downloads)')}`,
                    value: title
                }
            });
        const answer = await prompts({
            type: 'select',
            name: 'plugin',
            message: `Which do you want to install?`,
            initial: 0,
            choices
        });

        return answer.plugin;

    } else {
        const i = result.findIndex(x => x);
        
        if (i > -1) {
            console.log(`${tc.green('✔')} ${tc.bold('Resolved')} plugin ${tc.green('"' + pluginName + '"')} to ${tc.green('"' + variations[i] + '"')}`)
            return variations[i];
        }

    }

    throw new Error(`Unable to find TypeScript plugin matching ${tc.green('"' + pluginName + '"')}`);
}