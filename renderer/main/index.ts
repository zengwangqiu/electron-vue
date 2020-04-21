import path from "path";
import window from "./window";
import { dialog, app, ipcMain, BrowserWindow } from "electron";

let mainWindow: Electron.BrowserWindow;
let transparentWindow: Electron.BrowserWindow;
let recordingWindow: Electron.BrowserWindow;
let uploadWindow: Electron.BrowserWindow;
const exePath = path.dirname(app.getPath("exe"));
app.on("ready", () => {
  // 加载一次
  // BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/vue-devtools"));
  mainWindow = window.create(
    path.join(__dirname, "../public/index.html"),
    { width: 500, height: 300 },
    [
      { name: "setMenu", value: null },
    ],
  );
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("appPath", path.join(__dirname, "../.."));
  });
  mainWindow.webContents.openDevTools();
});

ipcMain.on("pick::path", async () => {
  const PATH = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  mainWindow.webContents.send("path::chosen", PATH.filePaths[0]);
});

ipcMain.on("start::record", () => {
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
      // alwaysOnTop: true,
    },
    [
      { name: "setMenu", value: null },
      // { name: "setIgnoreMouseEvents", value: true },
      // { name: "setFocusable", value: false },
      { name: "setFullScreen", value: true },
    ],
  );
  recordingWindow = window.create(
    urlRecording,
    { width: 250, height: 90 },
    [
      { name: "setMenu", value: null },
    ],
  );
});

ipcMain.on("stop::record", () => {
  transparentWindow.close();
  recordingWindow.close();
  mainWindow.show();

  mainWindow.webContents.send("video::finish", path.join(__dirname, "../..", "ffmpeg.exe"));
});

ipcMain.on("start::upload", () => {
  const URL = __dirname + "../public/index.html#uploading";
  uploadWindow = window.create(
    URL,
    { width: 680, height: 100 },
    [{ name: "setMenu", value: null }],
  );
}),

  ipcMain.on("upload::progress", (e, progress) => {
    uploadWindow.webContents.send("upload::progress", progress);
  });

ipcMain.on("upload::finish", (e, URL) => {
  uploadWindow.webContents.send("upload::finish", URL);
});
