const { spawn } = require('child_process');
const path = require('path');

const runCommand = (command, args, cwd) => {
  const child = spawn(command, args, { 
    cwd, 
    shell: true, 
    stdio: 'inherit' 
  });

  child.on('error', (err) => {
    console.error(`Failed to start ${command} in ${cwd}:`, err);
  });

  return child;
};

console.log('🚀 Starting HireMind Recruiting OS...');

const backend = runCommand('npm', ['run', 'dev:backend'], path.join(__dirname));
const frontend = runCommand('npm', ['run', 'dev:frontend'], path.join(__dirname));

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
