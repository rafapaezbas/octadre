const init = require('./init');
const { app, BrowserWindow  } = require('electron');

init.setupState();
init.setupScenes();
init.setupController();
init.setupClockInput();
init.render();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 550,
        height: 155,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        frame: false
    });
    win.setMenuBarVisibility(false);
    win.loadFile('./ui/index.html');
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
