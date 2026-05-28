#!/usr/bin/env node
const { spawn } = require('node:child_process');

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
