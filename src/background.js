const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let serverProcess;
let serverPID;
let mainWindow;
let loadingWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL('http://localhost:8080'); // URL вашего Vue приложения

    // Handle window close event to terminate the server process
    mainWindow.on('closed', function () {
        if (serverPID) {
            exec(`taskkill /PID ${serverPID} /F`, (err, stdout, stderr) => {
                if (err) {
                    console.error('Error killing server process:', err);
                } else if (stderr) {
                    console.error('Error killing server process:', stderr);
                } else {
                    console.log('Server process killed successfully.');
                }
                app.quit();
            });
        } else {
            app.quit();
        }
    });
}

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 640,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    loadingWindow.loadFile('C:\\Users\\Stoypik\\Desktop\\electron-vue-apps\\generation\\loading.html');
}

app.whenReady().then(() => {
    createMainWindow();
    createLoadingWindow();
    startServer();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

function startServer() {
    const command = 'powershell -NoLogo -WindowStyle Hidden -ExecutionPolicy Unrestricted -Command "cd C://stable-diffusion-webui; ./webui.bat --nowebui"';
    const maxBuffer = 100 * 1024 * 1024;

    serverProcess = exec(command, { detached: true, shell: true, maxBuffer: maxBuffer });

    serverProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        const match = data.toString().match(/Started server process \[(\d+)\]/);
        if (match && match[1]) {
            serverPID = parseInt(match[1]);
            console.log(`Server process PID: ${serverPID}`);
            loadingWindow.loadFile('C:\\Users\\Stoypik\\Desktop\\electron-vue-apps\\generation\\index.html');
        }
    });

    serverProcess.on('error', (err) => {
        console.error('Server process error:', err);
    });

    serverProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
