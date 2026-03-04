#!/usr/bin/env node

const [major] = process.versions.node.split('.').map(Number);

if (major < 20) {
  console.error('\x1b[31m');
  console.error('╔═══════════════════════════════════════════════════╗');
  console.error('║  word-signal requires Node.js v20 or higher.     ║');
  console.error(`║  You are running Node.js v${process.versions.node.padEnd(23)}║`);
  console.error('║                                                   ║');
  console.error('║  Upgrade: https://nodejs.org/                     ║');
  console.error('║  Or use:  nvm install 20 && nvm use 20            ║');
  console.error('╚═══════════════════════════════════════════════════╝');
  console.error('\x1b[0m');
  process.exit(1);
}

import('./index.js');
