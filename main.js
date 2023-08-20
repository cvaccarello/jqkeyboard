const electron = require('electron');
// Module to control application life.
const app = electron.app;
const ipc = electron.ipcMain;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const debug = function checkDebugFlag() { for (let arg of process.argv) { if (arg == '--debug') { return true } } return false; }();

var mainWindow = null;

// when ready, open a new electron window
app.on('ready', function() {
	mainWindow = new BrowserWindow({
		width: (debug)? 1800: 1000,
		height: 800,
		minWidth: 1000,
		autoHideMenuBar: true,
		useContentSize: true
	});

	mainWindow.on('closed', function() {
		mainWindow = null;
	});

	// automatically open dev tools when debug mode is running
	if (debug) { mainWindow.openDevTools(); }

	mainWindow.loadURL('file://' + __dirname + '/examples/index-electron.html');
});

// when all electron windows are closed, quit app
app.on('window-all-closed', function() {
	app.quit();
});
