/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  Tray,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import './api/request';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}
let appTray: any = null;
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 563,
    backgroundColor: '#36383b',
    resizable: false,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
  mainWindow.setMenu(null);
  // mainWindow.removeMenu();

  // 系统托盘图标目录
  const assetsDir = path.resolve(__dirname, './assets/icon/');
  appTray = new Tray(
    nativeImage.createFromPath(path.join(assetsDir, 'Player.png'))
  );

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '关于',
      click: () => {
        shell.openExternal('https://github.com/thunderstreak/music');
      },
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('Player');

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  // 系统托盘图标闪烁
  let count = 0;
  let timer: NodeJS.Timeout | null = null;
  timer = setInterval(() => {
    count += 1;
    appTray.setImage(
      nativeImage.createFromPath(
        path.join(assetsDir, count % 2 === 0 ? 'Player.png' : 'Player1.ico')
      )
    );
  }, 600);

  // 单点击 1.主窗口显示隐藏切换 2.清除闪烁
  appTray.on('click', () => {
    if (timer) {
      clearInterval(timer);
      appTray.setImage(
        nativeImage.createFromPath(path.join(assetsDir, 'Player.ico'))
      );
      // 主窗口显示隐藏切换
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      }
    }
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

if (process.env.E2E_BUILD === 'true') {
  // eslint-disable-next-line promise/catch-or-return
  app.whenReady().then(createWindow);
} else {
  app.on('ready', createWindow);
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// 关闭窗口
ipcMain.on('window-close', () => {
  // mainWindow.close();
  if (mainWindow) mainWindow.hide();
});
// 最小化窗口
ipcMain.on('window-min', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});
// 最大化窗口
ipcMain.on('window-max', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
