const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("biobesDesktop", {
  platform: process.platform,
  version: process.versions.electron,
});
