# Tauri 构建说明

本分支 (`copilot/setup-tauri-infrastructure`) 是在原有 Electron + React 音乐播放器基础上，使用 **Tauri v2** 重新搭建的跨平台桌面应用。原有业务功能完全保持不变。

---

## 构建产物（根目录）

| 文件/目录 | 说明 |
|-----------|------|
| `music-react` | **Tauri 应用可执行文件**（Linux x86-64 ELF 二进制，约 12.5 MB） |
| `dist/` | 前端打包产物（React + Redux + SCSS → web bundle） |
| `dist/index.html` | 应用入口 HTML |
| `dist/renderer.js` | 打包后的 JS bundle |
| `dist/style.css` | 打包后的样式文件 |

### 运行方式（Linux）

```bash
# 直接执行根目录下的二进制文件
chmod +x ./music-react
./music-react
```

---

## 项目结构变化

```
music-react/          ← 根目录
├── music-react       ← ✅ Tauri 可执行文件（新增，验收产物）
├── dist/             ← ✅ 前端打包产物（新增，Tauri webview 加载此目录）
├── src-tauri/        ← ✅ Tauri v2 Rust 后端（新增）
│   ├── src/
│   │   ├── lib.rs    ← 实现 window_min、window_close、get_song_lyric 命令
│   │   └── main.rs
│   ├── tauri.conf.json
│   ├── Cargo.toml
│   └── capabilities/
│       └── default.json
├── app/
│   └── bridge/
│       └── electron-shim.ts  ← ✅ Electron IPC 兼容层（新增）
├── configs/
│   └── webpack.config.tauri.babel.js  ← ✅ Tauri 专用 webpack 配置（新增）
└── app/app.tauri.html         ← ✅ Tauri webview HTML 模板（新增）
```

---

## Electron → Tauri 兼容层

原有代码中使用 `ipcRenderer.send/on` 的地方（窗口操作、歌词获取等）无需修改，通过 `app/bridge/electron-shim.ts` 实现了完全兼容的替换：

- `window-min` → Tauri window minimize
- `window-close` → Tauri window close
- `ipcRendererSongLyric` / `ipcMainSongLyric` → Rust 后端 HTTP 获取歌词

---

## 重新构建方式

如需在本机重新构建：

```bash
# 安装依赖
yarn install

# 仅构建前端
yarn tauri:build-renderer   # 产物输出到 dist/

# 完整构建（前端 + Rust 二进制）
yarn tauri:build            # 产物：dist/ + music-react 可执行文件
```

### 系统依赖（Linux）

```bash
sudo apt-get install libwebkit2gtk-4.1-dev libgtk-3-dev \
  libayatana-appindicator3-dev librsvg2-dev libsoup2.4-dev
```

---

## 原有 Electron 构建不受影响

- `yarn build` / `yarn start` 等 Electron 构建命令完全不变
- 所有原有业务逻辑（Redux store、API 请求、UI 组件）保持原样
- 仅新增 `src-tauri/`、`app/bridge/`、`configs/webpack.config.tauri.babel.js` 三处文件
