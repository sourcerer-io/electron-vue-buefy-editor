import { 
  app, BrowserWindow, ipcMain, dialog 
} from 'electron';
import { renderContent } from './renderer.js';
import { createServer, newContent } from './preview-server.js';
import { mainMenu } from './mainMenu.js';
import util from 'util';


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: { backgroundThrottling: false }
  });

  mainWindow.loadURL(winURL);
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  createServer();
  mainMenu(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});

ipcMain.on('newContentToRender', function(event, content) {
  const rendered = renderContent(content, 'layout1.html');
  // console.log(util.inspect(newContent));
  const previewURL = newContent(rendered);
  mainWindow.webContents.send('newContentToPreview', previewURL);
});

process.on('unhandledRejection', (reason, p) => {
  console.error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${reason}`);
});
