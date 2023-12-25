const path = require('path');
const fs = require('fs/promises');
const fsSync = require('fs');
const { spawn } = require('child_process');
const { PACKAGE_DIR, ROOT_DIR, readCompat } = require('./utils');

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

const dataDir = path.resolve(root, '.data');

/**
 * @param {string[]} args 
 */
async function run(args) {
  const jsonStr = await readCompat(PACKAGE_DIR).then((list) => JSON.stringify(list, undefined, 2));
  const name = 'rspack-compat.json'
  const abs = path.resolve(ROOT_DIR, name)
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
    await runCommand("git", ["push"]);
  } catch (error) {
    console.log(error)
  }
}

run(process.argv.slice(2))
