const { defineConfig } = require("@rspack/cli");
const rspack = require("@rspack/core");
const { VanillaExtractPlugin } = require("@vanilla-extract/webpack-plugin");

module.exports = defineConfig({
  plugins: [
    new VanillaExtractPlugin(),
    new rspack.HtmlRspackPlugin({ template: "./index.html" }),
  ],
  experiments: {
    css: true,
  },
});
