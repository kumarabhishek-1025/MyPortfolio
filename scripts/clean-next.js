const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nextDir = path.join(__dirname, '..', '.next');

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) { /* wait */ }
}

function tryRemove(dir) {
  fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return;

  const staleDir = `${dir}.old.${Date.now()}`;
  try {
    fs.renameSync(dir, staleDir);
    console.log('Cleared .next cache');

    try {
      tryRemove(staleDir);
    } catch {
      // Old folder can be removed on a later run.
    }
    return;
  } catch {
    // Fall through to direct delete.
  }

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      tryRemove(dir);
      console.log('Cleared .next cache');
      return;
    } catch {
      if (attempt < 5) sleepSync(500);
    }
  }

  if (process.platform === 'win32') {
    try {
      execSync(`rmdir /s /q "${dir}"`, { stdio: 'ignore' });
      console.log('Cleared .next cache');
      return;
    } catch {
      // Continue.
    }
  }

  console.warn('Warning: could not fully clear .next (OneDrive may be locking files). Continuing…');
}

clearDir(nextDir);
