import { build, copy, dts } from '@basmilius/tools';

await build({
    entrypoints: ['src/index.ts'],
    format: 'cjs',
    target: 'browser',
    packages: 'external',
    plugins: [
        dts(),
        copy('src/types.ts', 'dist/types.d.ts')
    ]
});
