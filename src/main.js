require ('./init');
const { app,BrowserWindow  } = require('electron');

exports.testF = () => {
    return "this comes from the main process";
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 500,
        height: 320,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
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
