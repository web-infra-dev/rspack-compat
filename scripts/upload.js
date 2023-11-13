const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const assert = require('assert');
const { spawn } = require('child_process')

async function runCommand(
  command,
  args,
  { verbose = true, env, onData } = {}
) {
  const hasOnData = typeof onData === "function";
  const stdio = verbose ? "inherit" : "ignore";
  const p = spawn(command, args, {
    shell: true,
    stdio: [stdio, hasOnData ? "pipe" : stdio, "inherit"],
    env: env
      ? {
        ...process.env,
        ...env
      }
      : undefined
  });
  if (hasOnData) {
    p.stdout.on("data", onData);
  }

  const exitCode = await new Promise(resolve => p.once("exit", resolve));
  if (exitCode !== 0)
    throw new Error(`${command} ${args.join(" ")} failed with ${exitCode}`);
}

function ok(value) {
  assert(value)
}


const root = path.resolve(__dirname, '..');
const dataDir = path.resolve(root, '.data');

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
 * @param {string[]} args 
 */
async function run(args) {
  const dir = path.resolve(root, 'packages');
  const jsonStr = await readCompat(dir).then((list) => JSON.stringify(list, undefined, 2));
  const name = 'rspack-compat.json'
  const abs = path.resolve(root, name)
  // write file to root
  await fs.writeFile(abs, jsonStr)

  const token = args[0];
  ok(typeof token === 'string');
  const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
  ok(typeof GITHUB_ACTOR === 'string');
  const repoUrl = `https://${GITHUB_ACTOR}:${token}@github.com/web-infra-dev/rspack-compat.git`;

  if (!fsSync.existsSync(dataDir)) {
    await runCommand("git", [
      "clone",
      "--branch",
      "data",
      "--single-branch",
      "--depth",
      "1",
      repoUrl,
      ".data"
    ])
  }
  process.chdir(dataDir);
  await runCommand("git", ["remote", "set-url", "origin", repoUrl]);
  await runCommand("git", ["reset", "--hard", "origin/data"]);
  await runCommand("git", ["pull", "--rebase"]);

  await fs.copyFile(abs, path.resolve(dataDir, name));
  // await fs.unlink(abs);

  await runCommand("ls", ["-alh"]);
  await runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"]);

  try {
    await runCommand("git", ["add", "."]);
    // git commit may run failed due there has no file changed
    await runCommand("git", ["commit", "-m", `"update compat info"`]);
    // await runCommand("git", ["push", "origin", "data", "-f"]);
  } catch (error) {
    console.log(error)
  }
}

run(process.argv.slice(2))
