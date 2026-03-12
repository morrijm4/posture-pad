import { parseArgs } from '../lib/args.ts';
import { decrypt } from '../lib/decrypt.ts';
import { readFile } from 'fs/promises';

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

    console.log(await decrypt(passphrase, ciphertext));
}

main();
