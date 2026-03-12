import '@pp/loadenv';
import { NewsletterRepository } from '@pp/db/repos/newsletter';
import { parseArgs } from '@/lib/args';
import { decrypt } from '@/lib/decrypt';

async function main() {
    const args = parseArgs();
    const repo = new NewsletterRepository()
    const users = await repo.get();

    const passphrase = args.get("passphrase") ?? args.get("p");

    await Promise.all(users.map(async ({ id, name, email }) => {
        if (passphrase) {
            name = await decrypt(passphrase, name);
            email = await decrypt(passphrase, email);
        }

        console.log(id, name, email)
    }));

    await repo.close();
}

main();

