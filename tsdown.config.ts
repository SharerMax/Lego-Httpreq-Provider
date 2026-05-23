import { defineConfig } from 'tsdown'

export default defineConfig({
  dts: {
    tsgo: true,
  },
  exports: true,
  copy: [
    { from: 'examples/config.toml', to: 'dist' },
  ],

  // ...config options
})
