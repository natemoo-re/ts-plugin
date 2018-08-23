/// @ts-ignore
import got from 'got';
/// @ts-ignore
import isScoped from 'is-scoped';
/// @ts-ignore
import registry from 'registry-url';
import { ChildProcess, spawn } from 'child_process';

const childProcesses: ChildProcess[] = [];


// https://github.com/sindresorhus/npm-name
export async function exists(name: string) {
    const isScopedPackage = isScoped(name);
    if (isScopedPackage) {
        name = name.replace(/\//g, '%2f');
    }

    try {
        await got.head(registry() + name.toLowerCase(), { timeout: 10000 });
        return true;
    } catch (error) {
        if (error.statusCode === 404) {
            return false;
        }

        if (isScopedPackage && error.statusCode === 401) {
            return false;
        }

        throw error;
    }
};

export async function downloads(name: string) {
    const isScopedPackage = isScoped(name);
    if (isScopedPackage) {
        name = name.replace(/\//g, '%2f');
    }

    try {
        const { body } = await got.get(`https://api.npmjs.org/downloads/point/last-week/${name}`, { timeout: 10000 });
        return JSON.parse(body).downloads;
    } catch (error) {
        if (error.statusCode === 404) return;
        if (isScopedPackage && error.statusCode === 401) return;

        throw error;
    }
}

export function formatNumber(num: number): string {
    return `${num}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function killChildren() {
    childProcesses.forEach(p => p.kill('SIGINT'));
}

export function npm(command: string, projectPath: string, stdio: any = 'ignore') {
    return new Promise((resolve, reject) => {
        const p = spawn('npm', [command], {
            shell: true,
            stdio,
            cwd: projectPath
        });
        p.once('exit', () => resolve());
        p.once('error', reject);
        childProcesses.push(p);
    });
}

export function onlyUnix(str: string) {
    return isWin() ? str : '';
}

export function printDuration(duration: number) {
    if (duration > 1000) {
        return `in ${(duration / 1000).toFixed(2)} s`;
    } else {
        const ms = parseFloat((duration).toFixed(3));
        return `in ${ms} ms`;
    }
}

export function isWin() {
    return process.platform === 'win32';
}

export function terminalPrompt() {
    return isWin() ? '>' : '$';
}