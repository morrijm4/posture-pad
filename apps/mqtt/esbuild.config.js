import * as esbuild from 'esbuild'

/** @type{import('esbuild').BuildOptions */
const options = {
    entryPoints: ['listener.ts'],
    outdir: 'dist',
    bundle: true,
    minify: true,
    treeShaking: true,
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    banner: {
        js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
    },
}

async function main() {
    const [cmd] = process.argv.slice(2)

    switch (cmd) {
        case 'watch': {
            const ctx = await esbuild.context(options)
            return await ctx.watch();
        } case 'build':
        default:
            return await esbuild.build(options);
    }
}

main();
