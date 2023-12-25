const assert = require('assert');
const path = require('path');
const fs = require('fs/promises');

/**
 * @param {string} name 
 * @returns {[string, string]}
 */
function splitPackageName(name) {
  return name.split('@')
}

/**
 * @param {string} dir 
 */
async function readCompat(dir) {
  const list = await fs.readdir(dir);
  return list.map(item => {
    const [name, version] = splitPackageName(item);
    const abs = path.resolve(dir, item, 'package.json');
    const info = require(abs).rspack;
    assert(typeof name === 'string', 'Please add the name for the supported plugin')
    assert(typeof version === 'string', `Please add the support version of \`${item}\``)
    assert(typeof info.version === 'string', 'Please add the minimal version of rspack supported in package.json')
    return {
      name,
      version,
      rspackVersion: info.version,
      path: path.relative(ROOT_DIR, path.resolve(dir, item))
    }
  })
}

const ROOT_DIR = path.resolve(__dirname, '..')
const PACKAGE_DIR = path.resolve(ROOT_DIR, 'packages');

module.exports = {
  readCompat,
  ROOT_DIR,
  PACKAGE_DIR
}