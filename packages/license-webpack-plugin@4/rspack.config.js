const { defineConfig } = require('@rspack/cli')
const { LicenseWebpackPlugin } = require("license-webpack-plugin");

module.exports = defineConfig({
  plugins: [
    new LicenseWebpackPlugin({
      stats: {
        warnings: false,
        errors: false
      },
      perChunkOutput: true,
      outputFilename: `3rdpartylicenses.txt`
    }),
  ]
});
