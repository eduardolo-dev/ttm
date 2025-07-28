#!/usr/bin/env node

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setPermissions() {
  const cliPath = path.join(__dirname, '../dist/cli.js');
  if (fs.existsSync(cliPath)) {
    fs.chmodSync(cliPath, '755');
    console.log('Permissions set for dist/cli.js');
  }
}

exec('babel --out-dir=dist source', (error) => {
  if (error) {
    console.error('Error compiling:', error);
    return;
  }
  setPermissions();
  console.log('Initial compilation completed');
});

import chokidar from 'chokidar';
chokidar.watch('source/**/*.js').on('change', () => {
  exec('babel --out-dir=dist source', (error) => {
    if (!error) {
      setPermissions();
      console.log('Recompiled and permissions updated');
    }
  });
});