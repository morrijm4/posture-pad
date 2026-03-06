import { writeFile } from 'fs/promises';
import crypto from 'crypto';
import sss from 'shamirs-secret-sharing';
import { parseArgs } from '../lib/args.ts';
import { SHARES, THRESHOLD } from './config.ts';

async function main() {
    const args = parseArgs();
    const passphrase = args.get("passphrase");

    if (passphrase == null)
        return console.log("Please pass the flag --passphrase=<STRING>");

    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase,
        },
    });

    console.log(Buffer.from(publicKey).toString('base64'));

    const parts: string[] = sss.split(Buffer.from(privateKey), {
        shares: SHARES,
        threshold: THRESHOLD,
    })

    await Promise.all(parts.map(async (sk, i) => writeFile('sk' + i, sk)));
}

main();
