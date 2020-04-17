import url from "url";
import path from "path";
import window from "./window";
import { dialog, app, ipcMain, BrowserWindow } from "electron";

let mainWindow: Electron.BrowserWindow;
let transparentWindow: Electron.BrowserWindow;
let recordingWindow: Electron.BrowserWindow;
let uploadWindow: Electron.BrowserWindow;

app.on("ready", () => {
  BrowserWindow.addDevToolsExtension(path.resolve(__dirname, "../../devTools/vue-devtools"));
  mainWindow = window.create(path.join(__dirname, "../public/index.html"), { width: 500, height: 300 }, []);
  mainWindow.webContents.openDevTools();
});

ipcMain.on("pick::path", async () => {
  const PATH = await dialog.showOpenDialog({ properties: ["openDirectory"] });
  mainWindow.webContents.send("path::chosen", PATH.filePaths[0]);
});

ipcMain.on("start::record", () => {
  mainWindow.minimize();
  const urlTransparent = __dirname + "../public/index.html#!transparent";
  const urlRecording = __dirname + "../public/index.html#!recording";
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
      { name: "setIgnoreMouseEvents", value: true },
      { name: "setFocusable", value: false },
      { name: "setFullScreen", value: true },
    ],
  );
  recordingWindow = window.create(
    urlRecording,
    { width: 250, height: 90 },
    [{ name: "setMenu", value: null }],
  );
});

ipcMain.on("stop::record", () => {
  transparentWindow.close();
  recordingWindow.close();
  mainWindow.show();
  mainWindow.webContents.send("video::finish");
});

ipcMain.on("start::upload", () => {
  const URL = __dirname + "../public/index.html#!/uploading";
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
  uploadWindow.webContents.send("upload::finish", url);
});
