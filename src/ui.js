const { app, BrowserWindow  } = require('electron');

exports.setupUI = () => {

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
};

const createWindow = () => {
	const win = new BrowserWindow({
		width: 570,
		height: 190,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		},
		frame: false
	});
	win.setMenuBarVisibility(false);
	win.loadFile('./ui/index.html');
};
