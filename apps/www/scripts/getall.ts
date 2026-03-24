import '@pp/loadenv';
import { Repository } from '@pp/db/repo';
import { parseArgs } from '@/lib/args';
import { decrypt } from '@/lib/decrypt';

async function main() {
    const args = parseArgs();
    const repo = new Repository()
    const users = await repo.getNewsletterRecipient({
        page: toInt(args.get("page")),
        perPage: toInt(args.get("perPage")),
    });

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

function toInt(val?: any): number | undefined {
    if (val == null) return;
    const parsed = Number(val)
    return Number.isNaN(parsed) ? undefined : parsed
}

main();

