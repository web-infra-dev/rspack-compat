const { defineConfig } = require('@rspack/cli')
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = defineConfig({
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ]
});;