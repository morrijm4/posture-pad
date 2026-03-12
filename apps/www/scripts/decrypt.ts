import { parseArgs } from '../lib/args.ts';
import { readFile } from 'fs/promises';
import sss from 'shamirs-secret-sharing';
import { SHARES } from './config.ts';
import { privateDecrypt } from 'crypto';

async function readSk(i: number): Promise<Buffer | undefined> {
    try {
        return await readFile('rsa' + i + '.key');
    } catch {/* do nothing */ }
}

async function main() {
    const args = parseArgs();
    const passphrase = args.get("passphrase");
    const ciphertext = args.get("ciphertext");

    if (ciphertext == null)
        return console.log("Noting to decrypt. Use --ciphertext=<STRING>")
    if (passphrase == null)
        return console.log("Please pass the flag --passphrase=<STRING>");

    const parts = await Promise.all(Array.from({ length: SHARES }).map((_, i) => readSk(i)));
    const privateKey = sss.combine(parts.filter(Boolean)).toString();

    const message = privateDecrypt({ key: privateKey, passphrase }, Buffer.from(ciphertext, 'base64'));
    console.log(message.toString());
}

main();
