import path from "path";
import window from "./window";
import { dialog, app, ipcMain, globalShortcut, Notification, shell, screen } from "electron";

let mainWindow: Electron.BrowserWindow;
let recorderWindow: Electron.BrowserWindow;
let controlWindow: Electron.BrowserWindow;
let uploadWindow: Electron.BrowserWindow;
let moveWindow: Electron.BrowserWindow;
let saveOnline = false;
let start = false;
let Path = "";
let arean = {
  x: 0,
  y: 0,
  width: 384,
  height: 216,
};
let winW = 0;
let winH = 0;

const ffmpegPath = path.join(__dirname, "../..", "ffmpeg.exe");
app.on("ready", () => {
  winW = screen.getPrimaryDisplay().workAreaSize.width;
  winH = screen.getPrimaryDisplay().workAreaSize.height;
  arean.x = (winW - arean.width) / 2;
  arean.y = (winH - arean.height) / 2;
  // 注册停止快捷键
  globalShortcut.register("CommandOrControl+S", () => {
    if (start) {
      // 通知录制窗口 录制结束
      recorderWindow.webContents.send("stop::record", Path, saveOnline, ffmpegPath);
      controlWindow.webContents.send("video::creating");
      recorderWindow.hide();
      moveWindow.hide();
      controlWindow.show();
    }
  });
  // 加载一次
  // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/vue-devtools"));
  mainWindow = window.create(
    path.join(__dirname, "../public/index.html"),
    {
      width: 500,
      height: 300,
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
  // mainWindow.webContents.openDevTools();
});

ipcMain.on("pick::path", async () => {
  const PATH = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  Path = PATH.filePaths[0];
  mainWindow.webContents.send("path::chosen", Path);
});

// 主窗口点击录制
ipcMain.on("start::record", () => {
  if (recorderWindow) { return; }
  // 主窗口最小化
  mainWindow.minimize();
  const recorderURL = path.join(__dirname, "../public/index.html#recorder");
  const controlURL = path.join(__dirname, "../public/index.html#control");
  const moveURL = path.join(__dirname, "../public/index.html#move");
  recorderWindow = window.create(
    recorderURL,
    {
      width: arean.width,
      height: arean.height,
      x: arean.x,
      y: arean.y,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      useContentSize: true,
      movable: false,
      // modal: true,
      // parent: mainWindow,
    },
    [
      { name: "setMenu", value: null },
    ],
  );

  moveWindow = window.create(
    moveURL,
    {
      x: arean.x + arean.width - 32,
      y: arean.y + arean.height,
      width: 32,
      height: 32,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      useContentSize: true,
      parent: recorderWindow,
      // modal: true,
    },
    [
      { name: "setMenu", value: null },
      // { name: "setIgnoreMouseEvents", value: true },
      // { name: "setFocusable", value: false },
      // { name: "setFullScreen", value: true },
    ],
  );
  // moveWindow.webContents.openDevTools();
  controlWindow = window.create(
    controlURL,
    {
      width: 250,
      height: 100,
      x: winW / 2 - 125,
      y: winH - 100,
      alwaysOnTop: true,
      resizable: false,
      movable: true,
      // parent: recorderWindow,
    },
    [
      { name: "setMenu", value: null },
    ],
  );

  // 打开调试工具
  // recorderWindow.webContents.openDevTools();


  // 改变录制区域大小事件监听
  recorderWindow.on("will-resize", (e, newRectangle) => {
    if (newRectangle.width < 100 || newRectangle.height < 100) {
      e.preventDefault();
    } else {
      arean = newRectangle;
      moveWindow.setPosition(arean.x + arean.width - 32, arean.y + arean.height);
      // 通知主窗口更新数据
      recorderWindow.webContents.send("arean::size", newRectangle);
    }
  });

  // 改变录制区域大小位置事件监听
  moveWindow.on("will-move", (e, newRectangle) => {
    if (newRectangle.x + 32 - arean.width < 0 || newRectangle.y - arean.height < 0) {
      e.preventDefault();
    } else {
      arean.x = newRectangle.x + 32 - arean.width;
      arean.y = newRectangle.y - arean.height;

      recorderWindow.setPosition(arean.x, arean.y);
      // 通知主窗口更新数据
      recorderWindow.webContents.send("arean::move", arean);
    }
  });

  // 控制窗口关闭
  controlWindow.on("closed", () => {
    controlWindow = null;
    if (recorderWindow) {
      recorderWindow.close();
      recorderWindow = null;
    }
  });
  recorderWindow.on("closed", () => {
    recorderWindow = null;
    if (controlWindow) {
      controlWindow.close();
      controlWindow = null;
    }
  });


  mainWindow.on("closed", () => {
    mainWindow = null;
    if (recorderWindow) {
      recorderWindow.close();
      recorderWindow = null;
    }
  });
});

ipcMain.on("video::finished", (e, message) => {
  controlWindow.close();
  shell.openItem(Path);
  const notification = new Notification({
    title: "录制",
    body: message,
  });
  notification.show();
});

// 录制取域选择确认
ipcMain.on("arean::chose", () => {
  const sizes = recorderWindow.getContentSize();
  const posiontion = recorderWindow.getPosition();
  controlWindow.minimize();
  recorderWindow.setResizable(false);
  // 通知录制窗口开始录制
  recorderWindow.webContents.send("arean::chose");
  // 通知录制窗口录制区域数据
  recorderWindow.webContents.send("arean::size",
    {
      x: posiontion[0],
      y: posiontion[1],
      width: sizes[0],
      height: sizes[1],
    },
  );
});

// 录制结束
ipcMain.on("stop::record", () => {
  recorderWindow.webContents.send("stop::record", Path, saveOnline, ffmpegPath);
  controlWindow.webContents.send("video::creating");
  recorderWindow.hide();
  moveWindow.hide();
  controlWindow.show();
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

// 监听保存
ipcMain.on("choose::save", (e, SaveOnline) => {
  saveOnline = SaveOnline;
});


ipcMain.on("recorder::start", () => {
  start = true;
});
ipcMain.on("recorder::end", () => {
  start = false;
});
