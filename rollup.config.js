import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        sourcemap: true,
        dir: 'dist/esm',
        format: 'esm'
      },
      {
        sourcemap: true,
        dir: 'dist/cjs',
        format: 'cjs'
      }
    ],
    external: [
      'class-validator',
      'class-transformer',
    ],
    plugins: [typescript({
      sourceMap: true,
      inlineSources: false
    })],
    watch: {
      clearScreen: false
    }
  }
]
