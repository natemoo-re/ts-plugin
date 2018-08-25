import tc from 'turbocolor';
import { configurePlugin, isValidSubcommand, installPlugin, listPlugins, uninstallPlugin } from './commands';
import { resolvePluginName, resolveInstalledPluginName } from './resolve-plugin';
import { scanProject } from './project';
import { toShortName } from './utils';

const INSTALL_DOCS = `ts-plugin install <plugin-name>

${tc.dim('aliases: i')}`;

const UNINSTALL_DOCS = `ts-plugin uninstall <plugin-name>

${tc.dim('aliases: u')}`;

const CONFIG_DOCS = `ts-plugin config set <key> <value> [-p|--plugin <name>]
ts-plugin config get <key> [-p|--plugin <name>]
ts-plugin config delete <key> [-p|--plugin <name>]
ts-plugin config list [-p|--plugin <name>]
ts-plugin config edit
ts-plugin get <key> -p|--plugin <name>
ts-plugin set <key> <value> -p|--plugin <name>

aliases: c`;
function Docs(...values: string[]) {
    return `Usage:

${values.join('\n')}`;
}
const HELP_DOCS = Docs(INSTALL_DOCS, UNINSTALL_DOCS);

async function run() {
    let args = process.argv.slice(2);
    const cmd = args[0];

    const list = args.indexOf('--list') >= 0 || args.indexOf('-l') >= 0;
    const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0;
    const hasPlugin = args.indexOf('--plugin') >= 0 || args.indexOf('-p') >= 0;
    // TODO Fix parsing of plugin option
    const plugin = hasPlugin ? args[(args.indexOf('--plugin') || args.indexOf('-p')) + 1] : null;

    args = args.filter(a => a[0] !== '-');
    // args = args.filter(a => (hasPlugin) ? a !== plugin : true);

    // console.log('Filtered ARGS');
    // console.dir(args);

    if (help) {
        console.log(HELP_DOCS);
        return 0;
    }
    try {
        await scanProject();

        switch (cmd) {
            case 'test':
                console.log(toShortName(args[1]));
                break;
            case 'get':
            case 'set':
                args.splice(0, 0, 'config');
            case 'config':
            case 'c':
                if (list) args.splice(1, 0, 'list');
                (args[1] && isValidSubcommand(args[1]))
                    ? await configurePlugin(args[1], plugin, ...args.slice(2))
                    : console.log(Docs(UNINSTALL_DOCS) + '\n');
                break;
            case 'install':
            case 'i':
                (args[1])
                    ? await installPlugin(resolvePluginName(args[1]))
                    : console.log(Docs(INSTALL_DOCS) + '\n');
                break;
            case 'list':
            case 'ls':
                await listPlugins();
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