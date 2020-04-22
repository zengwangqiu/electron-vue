import path from "path";
import window from "./window";
import { dialog, app, ipcMain, BrowserWindow } from "electron";

let mainWindow: Electron.BrowserWindow;
let transparentWindow: Electron.BrowserWindow;
let recordingWindow: Electron.BrowserWindow;
let uploadWindow: Electron.BrowserWindow;

app.on("ready", () => {
  // 加载一次
  // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/vue-devtools"));
  mainWindow = window.create(
    path.join(__dirname, "../public/index.html"),
    { width: 500, height: 400 },
    [
      { name: "setMenu", value: null },
    ],
  );
  // 主窗口加载完成
  mainWindow.webContents.on("did-finish-load", () => {
    // 发送根目录
    mainWindow.webContents.send("appPath", path.join(__dirname, "../.."));
  });

  // 打开调试工具
  // mainWindow.webContents.openDevTools();
});

ipcMain.on("pick::path", async () => {
  const PATH = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  mainWindow.webContents.send("path::chosen", PATH.filePaths[0]);
});

// 主窗口点击录制
ipcMain.on("start::record", () => {
  // 主窗口最小化
  mainWindow.minimize();
  const urlTransparent = path.join(__dirname, "../public/index.html#transparent");
  const urlRecording = path.join(__dirname, "../public/index.html#recording");
  transparentWindow = window.create(
    urlTransparent,
    {
      width: 1000,
      height: 500,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
    },
    [
      { name: "setMenu", value: null },
      // { name: "setIgnoreMouseEvents", value: true },
      // { name: "setFocusable", value: false },
      // { name: "setFullScreen", value: true },
    ],
  );
  recordingWindow = window.create(
    urlRecording,
    {
      width: 250,
      height: 400,
      alwaysOnTop: true,
    },
    [
      { name: "setMenu", value: null },
    ],
  );

  // 打开调试工具
  // recordingWindow.webContents.openDevTools();

  // 已经开始录制
  ipcMain.on("record::start", () => {
    // 通知控制窗口改变按钮状态
    recordingWindow.webContents.send("record::start");
  });

  // 重置录制区域事件监听
  transparentWindow.on("will-resize", (e, newsize) => {
    // 通知主窗口更新数据
    mainWindow.webContents.send("arean::size", newsize);
  });

  // 控制窗口关闭
  recordingWindow.on("closed", () => {
    transparentWindow.close();
  });
});

// 录制取域选择确认
ipcMain.on("arean::chose", () => {
  const sizes = transparentWindow.getContentSize();
  const posiontion = transparentWindow.getPosition();
  transparentWindow.setIgnoreMouseEvents(true);
  transparentWindow.setFocusable(true);

  // 通知主窗口开始录制
  mainWindow.webContents.send("start::record");
  // 通知主窗口录制取域数据
  mainWindow.webContents.send("arean::size", { x: posiontion[0], y: posiontion[1], width: sizes[0], height: sizes[1] });
});

// 录制结束
ipcMain.on("stop::record", () => {
  recordingWindow.close();
  mainWindow.show();

  // 通知主窗口 录制结束
  mainWindow.webContents.send("video::finish", path.join(__dirname, "../..", "ffmpeg.exe"));
});

// 监听开始上传
ipcMain.on("start::upload", () => {
  const URL = __dirname + "../public/index.html#uploading";
  uploadWindow = window.create(
    URL,
    { width: 680, height: 100 },
    [{ name: "setMenu", value: null }],
  );
});

// 监听上传进度
ipcMain.on("upload::progress", (e, progress) => {
  uploadWindow.webContents.send("upload::progress", progress);
});

// 监听上传完成
ipcMain.on("upload::finish", (e, URL) => {
  uploadWindow.webContents.send("upload::finish", URL);
});
