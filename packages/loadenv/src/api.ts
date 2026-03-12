import path from 'path';
import fs from 'fs';

const ROOT_PACKAGE_JSON_NAME = 'posture-pad';
const ENV_FILE_NAMES = ['.env', '.env.local'];

function findRootPath(): string {
    let current = process.cwd();

    while (true) {
        const pkgPath = path.join(current, 'package.json');

        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

            if (pkg.name == ROOT_PACKAGE_JSON_NAME) {
                return current;
            }
        }

        const parent = path.dirname(current);

        if (current == parent) {
            throw new Error("Could not find root directory");
        }

        current = parent;
    }
}

export async function loadenv() {
    const rootPath = findRootPath();

    for (const envFileName of ENV_FILE_NAMES) {
        const envPath = path.join(rootPath, envFileName);

        if (!fs.existsSync(envPath)) {
            continue;
        }

        const envFile = fs.readFileSync(envPath, 'utf8')

        for (const line of envFile.split("\n")) {
            const [key, ...value] = line.split("=")

            if (typeof key !== 'string') {
                continue;
            }

            process.env[key] = value.join('')
        }
    }
}
