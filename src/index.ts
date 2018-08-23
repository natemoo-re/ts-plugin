import tc from 'turbocolor';
import { installPlugin } from './install';
import { uninstallPlugin } from './uninstall';
import { resolvePluginName, resolveInstalledPluginName } from './resolve-plugin';
import { scanProject } from './project';

const INSTALL_DOCS = `ts-plugin install [plugin-name]`;
const UNINSTALL_DOCS = `ts-plugin uninstall [plugin-name]`;
function Docs(...values: string[]) {
    return `Usage:

${values.join('\n')}`;
}
const HELP_DOCS = Docs(INSTALL_DOCS, UNINSTALL_DOCS);

async function run() {
    let args = process.argv.slice(2);
    const cmd = args[0];

    // console.log(args);
    const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0;
    args = args.filter(a => a[0] !== '-');

    if (help) {
        console.log(HELP_DOCS);
        return 0;
    }
    try {
        await scanProject();

        switch (cmd) {
            case 'install':
            case 'i':
                (args[1])
                    ? await installPlugin(resolvePluginName(args[1]))
                    : console.log(Docs(INSTALL_DOCS) + '\n');
                break;
            case 'uninstall':
            case 'u':
                (args[1])
                    ? await uninstallPlugin(resolveInstalledPluginName(args[1]))
                    : console.log(Docs(UNINSTALL_DOCS) + '\n');
                break;
            default: throw new Error(HELP_DOCS);
        }
    } catch (e) {
        console.error(`\n${tc.red('✖')} ${e.message}\n`);
    }
}

run();