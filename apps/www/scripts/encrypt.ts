import { encrypt } from '../lib/encrypt.ts';

async function main() {
    process.loadEnvFile('.env');
    for (const msg of process.argv.slice(2)) {
        console.log(encrypt(msg));
    }
}

main();
