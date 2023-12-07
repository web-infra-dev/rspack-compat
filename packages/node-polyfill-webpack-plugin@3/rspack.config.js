
const polyfillPlugin = require('node-polyfill-webpack-plugin');
module.exports = {
  mode: 'none',
  entry: {
    main: './src/index.js'
  },
  plugins: [new  polyfillPlugin()]
}