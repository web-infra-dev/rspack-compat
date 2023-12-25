const { readCompat, PACKAGE_DIR } = require("./utils");

async function runCheck() {
  await readCompat(PACKAGE_DIR) 
  console.log('=== check syntax success')
}

runCheck();