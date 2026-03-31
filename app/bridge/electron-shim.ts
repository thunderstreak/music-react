/**
 * Tauri-compatible shim for Electron's ipcRenderer.
 *
 * When building with Tauri the real `electron` module is unavailable in the
 * renderer; the webpack alias in webpack.config.tauri points `electron` to
 * this file so the existing business code compiles and runs without changes.
 */

// @ts-ignore – @tauri-apps/api is only present in the Tauri build
import { invoke } from '@tauri-apps/api/core';
// @ts-ignore
import { listen } from '@tauri-apps/api/event';
// @ts-ignore
import { getCurrentWindow } from '@tauri-apps/api/window';

type IpcListener = (event: any, ...args: any[]) => void;

const listeners: Record<string, IpcListener[]> = {};

export const ipcRenderer = {
  send(channel: string, ...args: any[]): void {
    if (channel === 'window-min') {
      getCurrentWindow().minimize().catch(console.error);
    } else if (channel === 'window-close') {
      getCurrentWindow().close().catch(console.error);
    } else if (channel === 'ipcRendererSongLyric') {
      const songId = args[0];
      invoke<string[]>('get_song_lyric', { songId })
        .then((lyric: string[]) => {
          const cbs = listeners['ipcMainSongLyric'] || [];
          cbs.forEach((cb) => cb({}, lyric));
        })
        .catch(console.error);
    } else {
      invoke(channel, { args }).catch(console.error);
    }
  },

  on(channel: string, callback: IpcListener): typeof ipcRenderer {
    if (!listeners[channel]) {
      listeners[channel] = [];
      // Also listen for native Tauri events on the same channel name
      listen(channel, (e: any) => {
        const cbs = listeners[channel] || [];
        cbs.forEach((cb) => cb(e, e.payload));
      });
    }
    listeners[channel].push(callback);
    return ipcRenderer;
  },

  removeListener(channel: string, callback: IpcListener): typeof ipcRenderer {
    if (listeners[channel]) {
      listeners[channel] = listeners[channel].filter((cb) => cb !== callback);
    }
    return ipcRenderer;
  },
};

export const ipcMain = {
  on() {},
  send() {},
};

export default { ipcRenderer, ipcMain };
