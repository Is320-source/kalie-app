// dev.js
const { spawn } = require('child_process');

const child = spawn('npx', ['ts-node', '--transpile-only', 'src/server.ts'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`Processo encerrado com código ${code}`);
});