import path from "path";
import window from "./window";
import { dialog, app, ipcMain, globalShortcut } from "electron";

let mainWindow: Electron.BrowserWindow;
let recorderWindow: Electron.BrowserWindow;
let controlWindow: Electron.BrowserWindow;
let uploadWindow: Electron.BrowserWindow;

app.on("ready", () => {
  // 注册停止快捷键
  globalShortcut.register("CommandOrControl+S", () => {

    controlWindow.close();
    mainWindow.show();

    // 通知主窗口 录制结束
    mainWindow.webContents.send("video::finish", path.join(__dirname, "../..", "ffmpeg.exe"));
  });
  // 加载一次
  // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/vue-devtools"));
  mainWindow = window.create(
    path.join(__dirname, "../public/index.html"),
    {
      width: 500,
      height: 700,
    },
    [
      { name: "setMenu", value: null },
      // { name: "setSkipTaskbar", value: true },
    ],
  );
  // 主窗口加载完成
  mainWindow.webContents.on("did-finish-load", () => {
    // 发送根目录
    mainWindow.webContents.send("appPath", path.join(__dirname, "../.."));
  });

  // 打开调试工具
  mainWindow.webContents.openDevTools();
});

ipcMain.on("pick::path", async () => {
  const PATH = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  mainWindow.webContents.send("path::chosen", PATH.filePaths[0]);
});

// 主窗口点击录制
ipcMain.on("start::record", () => {
  // 主窗口最小化
  mainWindow.minimize();
  const recorderURL = path.join(__dirname, "../public/index.html#recorder");
  const controlURL = path.join(__dirname, "../public/index.html#control");
  recorderWindow = window.create(
    recorderURL,
    {
      width: 300,
      height: 300,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      useContentSize: true,
      modal: true,
      parent: mainWindow,
    },
    [
      { name: "setMenu", value: null },
      // { name: "setIgnoreMouseEvents", value: true },
      // { name: "setFocusable", value: false },
      // { name: "setFullScreen", value: true },
    ],
  );
  // recorderWindow.webContents.openDevTools();
  controlWindow = window.create(
    controlURL,
    {
      width: 250,
      height: 100,
      alwaysOnTop: true,
      resizable: false,
      movable: true,
      parent: recorderWindow,
    },
    [
      { name: "setMenu", value: null },
    ],
  );

  // 打开调试工具
  // controlWindow.webContents.openDevTools();

  // 已经开始录制
  ipcMain.on("record::start", () => {
    // 通知控制窗口改变按钮状态
    controlWindow.minimize();
    mainWindow.show();
    controlWindow.webContents.send("record::start");
  });

  // 改变录制区域大小事件监听
  recorderWindow.on("will-resize", (e, newRectangle) => {
    // 通知主窗口更新数据
    mainWindow.webContents.send("arean::size", newRectangle);
  });

  // 改变录制区域大小位置事件监听
  recorderWindow.on("will-move", (e, newRectangle) => {
    // 通知主窗口更新数据
    mainWindow.webContents.send("arean::move", newRectangle);
  });

  // 控制窗口关闭
  controlWindow.on("closed", () => {
    recorderWindow.close();
  });
});

// 录制取域选择确认
ipcMain.on("arean::chose", () => {
  const sizes = recorderWindow.getContentSize();
  const posiontion = recorderWindow.getPosition();
  // recorderWindow.setIgnoreMouseEvents(true);
  // recorderWindow.setFocusable(true);

  // 通知主窗口开始录制
  mainWindow.webContents.send("start::record");
  // 通知主窗口录制取域数据
  mainWindow.webContents.send("arean::size", { x: posiontion[0], y: posiontion[1], width: sizes[0], height: sizes[1] });
});

// 录制结束
ipcMain.on("stop::record", () => {
  controlWindow.close();
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
