import { build, clean, copy, dts } from '@basmilius/tools';

await build({
    entrypoints: ['src/index.ts'],
    format: 'cjs',
    target: 'browser',
    external: ['homey'],
    sourcemap: false,
    plugins: [
        clean('dist'),
        copy('src/types.ts', 'dist/types.d.ts'),
        dts()
    ]
});
