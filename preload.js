// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    createOptimizedRouteWindow: () => ipcRenderer.send('create-optimized-route-window')
});