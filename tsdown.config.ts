import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: {
    tsgo: true,
  },
  exports: true,
  copy: [
    { from: 'package.json', to: 'dist' },
    { from: 'pnpm-lock.yaml', to: 'dist' },
    { from: 'examples/config.toml', to: 'dist' },
  ],

  // ...config options
})
