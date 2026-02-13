const { exec } = require('child_process');

const port = 3000;
const command = process.platform === 'win32'
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port}`;

exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error: ${err.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Port ${port} usage:\n${stdout}`);

    if (stdout) {
        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            console.log(`Potential PID: ${pid}`);
        });
    } else {
        console.log(`No process found on port ${port}`);
    }
});
