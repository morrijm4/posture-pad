import { readFile } from 'fs/promises';
import sss from 'shamirs-secret-sharing';
import { SHARES } from '../scripts/config.ts';
import { privateDecrypt } from 'crypto';

async function readSk(i: number): Promise<Buffer | undefined> {
    try {
        return await readFile('rsa' + i + '.key');
    } catch {/* do nothing */ }
}

export async function decrypt(passphrase: string, ciphertext: string) {
    const parts = await Promise.all(
        Array.from({ length: SHARES }).map((_, i) => readSk(i))
    );

    const privateKey = sss.combine(parts.filter(Boolean)).toString();

    const message = privateDecrypt(
        {
            key: privateKey,
            passphrase
        },
        Buffer.from(ciphertext, 'base64')
    );

    return message.toString();
}
