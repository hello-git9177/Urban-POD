const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let podControlWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


function createOptimizedRouteWindow() {
    const optimizedRouteWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    optimizedRouteWindow.loadFile('optimized_route.html');

    optimizedRouteWindow.on('closed', () => {
        optimizedRouteWindow = null;
    });
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});

app.whenReady().then(() => {
    createMainWindow();
});

ipcMain.on('fetch-data', async (event) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:5000/get_bookings');
        const data = await response.json();
        event.reply('data', data);
    } catch (error) {
        console.error('Error fetching data:', error);
        event.reply('data', { message: 'Failed to fetch data' });
    }
});

ipcMain.on('create-optimized-route-window', () => {
    createOptimizedRouteWindow();
});

