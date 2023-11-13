const path = require('path');
const fs = require('fs/promises');
const assert = require('assert');

function ok(value) {
  assert(value)
}

const root = path.resolve(__dirname, '..');

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
    ok(typeof info.version === 'string')
    ok(typeof name === 'string')
    ok(typeof version === 'string')
    return {
      name,
      version,
      rspackVersion: info.version,
      path: path.relative(root, path.resolve(dir, item))
    }
  })
}

/**
 * 
 * @param {string[]} args 
 */
function run(args) {
  const dir = path.resolve(root, './packages');
  const name = 'rspack-compat.json'
  return readCompat(dir)
    .then((list) => JSON.stringify(list, undefined, 2))
    .then((json) => {
      if (!args.includes('check')) {
        return fs.writeFile(path.resolve(root, name), json)
      }
    })
}

run(process.argv.slice(2))
