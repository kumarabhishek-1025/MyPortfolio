const { execSync } = require('child_process');

const port = process.argv[2] || '3000';

function freePortWindows() {
  try {
    const output = execSync(`netstat -ano | findstr ":${port}"`, { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split('\n')) {
      if (!line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed port ${port} (stopped PID ${pid})`);
    }
  } catch {
    // Port is already free.
  }
}

function freePortUnix() {
  try {
    execSync(`lsof -ti tcp:${port} | xargs kill -9`, { stdio: 'ignore', shell: true });
    console.log(`Freed port ${port}`);
  } catch {
    // Port is already free.
  }
}

if (process.platform === 'win32') {
  freePortWindows();
} else {
  freePortUnix();
}
