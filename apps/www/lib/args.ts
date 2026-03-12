export function parseArgs(): Map<string, string> {
    const args = new Map<string, string>();

    for (const arg of process.argv) {
        if (!arg.startsWith("-")) continue;
        const [k, ...v] = arg.split("=");
        args.set(k.slice(k.startsWith("--") ? 2 : 1), v.join(''));
    }

    return args;
}
