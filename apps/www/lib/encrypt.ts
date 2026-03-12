import { publicEncrypt } from "crypto";

export function encrypt(message: string): string {
    const publicKey = process.env.ENCRYPTION_PUBLIC_KEY
    if (publicKey == null) throw new Error("No public key");
    return publicEncrypt(Buffer.from(publicKey, 'base64'), message).toString('base64');
}
