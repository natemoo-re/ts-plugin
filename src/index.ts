import tc from 'turbocolor';
import { installPlugin } from './install';
import { resolvePluginName } from './resolve-plugin';
import { scanProject } from './project';
// import { getStarterRepo } from './starters';
// import { cleanup } from './utils';

const USAGE_DOCS = `Usage:

npx ts-plugin install [plugin-name]
`;

async function run() {
    let args = process.argv.slice(2);
    const cmd = args[0];

    // const autoRun = args.indexOf('--run') >= 0;
    const help = args.indexOf('--help') >= 0 || args.indexOf('-h') >= 0;

    args = args.filter(a => a[0] !== '-');

    if (help) {
        console.log(USAGE_DOCS);
        return 0;
    }
    try {
        await scanProject();

        switch (cmd) {
            case 'install':
                await installPlugin(resolvePluginName(args[1]));
                break;
            case 'uninstall':
                // await uninstallPlugin(guessPluginName(args[1]));
                break;
            default: throw new Error(USAGE_DOCS);
        }
    } catch (e) {
        console.error(`\n${tc.red('✖')} ${e.message}\n`);
    }
}

run();