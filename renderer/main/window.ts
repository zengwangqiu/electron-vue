import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";
export type WinMethodsName = "setMenu" | "setIgnoreMouseEvents" | "setFocusable" | "setFullScreen";

export default {
  create(
    winUrl: string,
    options?: BrowserWindowConstructorOptions,
    methods: Array<{ name: WinMethodsName, value: any }> = [],
  ): BrowserWindow {
    let config: BrowserWindowConstructorOptions = {
      useContentSize: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: false,
      },
    };
    config = Object.assign(config, options);
    let windowId = new BrowserWindow(config);
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < methods.length; i++) {
      windowId[methods[i].name](methods[i].value);
    }
    windowId.loadURL(winUrl);
    windowId.on("closed", () => { windowId = null; });
    return windowId;
  },
};
