const { defineConfig } = require('@rspack/cli')
const tererPlugin = require('terser-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const rspack = require('@rspack/core');
module.exports = defineConfig({
  plugins: [
    new StatsWriterPlugin()
  ],
  optimization: {
    minimizer: [
      new tererPlugin(),
      new rspack.SwcCssMinimizerRspackPlugin()
    ]
  }
});;