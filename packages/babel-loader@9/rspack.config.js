const { defineConfig } = require('@rspack/cli')

module.exports = defineConfig({
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript'
            ]
          }
        }
      }
    ]
  }
});;