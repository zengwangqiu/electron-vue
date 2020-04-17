import { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

export default {
  create(
    winUrl: string,
    options?: BrowserWindowConstructorOptions,
    methods?: Array<{ name: keyof BrowserWindow, value: any }>,
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
      const method = windowId[methods[i].name];
      if (typeof method === "function") {
        method.call(methods[i].value);
      }
    }
    windowId.loadURL(winUrl);
    windowId.on("closed", () => { windowId = null; });
    return windowId;
  },
};
