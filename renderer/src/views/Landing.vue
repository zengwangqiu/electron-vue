<template>
  <div class="landing">
    <header>
      <h1 class="landing__header">录屏</h1>
    </header>
    <section class="landing__path">
      <div class="landing__path-text">
        <span>{{ outputVideoPath }}</span>
      </div>
      <button class="landing__path-button" type="button" @click="openDialog()">选择保存路径</button>
    </section>
    <section class="landing__options">
      <input type="checkbox" id="saveOnline" v-model="saveOnline" />
      <label for="saveOnline">上传到云端</label>
    </section>
    <section>
      <button class="landing__button" type="button" @click="startRecord()">Start Recording</button>
    </section>
  </div>
</template>

<script>
const path = window.require("path");
const exec = window.require("child_process");
const fs = window.require("fs");
const { ipcRenderer, desktopCapturer } = window.require("electron");
let recorder;
let blobs = [];
export default {
  name: "Landing",
  data() {
    return {
      outputVideoPath: "",
      saveOnline: false,
      justSaved: false,
    };
  },
  components: {},
  methods: {
    openDialog() {
      ipcRenderer.send("pick::path");
    },
    startRecord() {
      if (this.outputVideoPath) {
        this.start();
        ipcRenderer.send("start::record");
      } else alert("Please establish saving path.");
    },
    start() {
      desktopCapturer
        .getSources({ types: ["screen"] })
        .then(async sources => {
          const stream = await navigator.webkitGetUserMedia(
            {
              audio: {
                mandatory: {
                  chromeMediaSource: "desktop"
                }
              },
              video: {
                mandatory: {
                  chromeMediaSource: "desktop"
                }
              }
            },
            this.handleStream,
            err => {
              console.log("error", err);
            }
          );
        })
        .catch(error => console.log(error));
    },
    handleStream(stream) {
      recorder = new MediaRecorder(stream);
      blobs = [];
      recorder.ondataavailable = function (event) {
        blobs.push(event.data);
      };
      recorder.start();
    },
    toArrayBuffer(blob, cb) {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        const arrayBuffer = this.result;
        cb(arrayBuffer);
      };
      fileReader.readAsArrayBuffer(blob);
    },
    toBuffer(ab) {
      const buffer = new Buffer(ab.byteLength);
      const arr = new Uint8Array(ab);
      for (let i = 0; i < arr.byteLength; i++) {
        buffer[i] = arr[i];
      }
      return buffer;
    },
    stopRecord(userPath, saveOnline) {
      recorder.onstop = () => {
        this.toArrayBuffer(new Blob(blobs, { type: "video/webm" }), chunk => {
          const buffer = this.toBuffer(chunk);
          const randomString = Math.random()
            .toString(36)
            .substring(7);
          const randomName = "/" + randomString + "-shot.webm";
          const mpath = userPath + randomName;
          fs.writeFile(mpath, buffer, function (err) {
            if (!err) {
              console.log(
                "Saved video: " + mpath,
                "do save online?",
                saveOnline
              );
              exec(
                `${path.join(
                  __dirname,
                  "../..",
                  "ffmpeg.exe"
                )} -i ${mpath} -vcodec h264 ${path.join(userPath, "test.mp4")}`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(`cmd error: ${error}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                  console.error(`stderr: ${stderr}`);
                }
              );
              if (saveOnline) {
                console.log("save online");
                const buff = Buffer.from(buffer).toString("base64");
                $http({
                  method: "POST",
                  url: "https://api.cloudinary.com/v1_1/dyqhomagf/upload",
                  data: {
                    upload_preset: "bsfgxm61",
                    file: "data:video/webm;base64," + buff
                  },
                  uploadEventHandlers: {
                    progress: function (e) {
                      console.log(e);
                      if (e && e.total && e.loaded) {
                        const progress = Math.floor((e.loaded / e.total) * 100);
                        ipcRenderer.send("upload::progress", progress);
                      }
                    }
                  }
                })
                  .then(function (res) {
                    console.log("Saved online", res.data.secure_url);
                    ipcRenderer.send("upload::finish", res.data.secure_url);
                  })
                  .catch(function (err) {
                    console.log("Error saving online", err);
                  });
              }
            } else {
              alert("Failed to save video " + err);
            }
          });
        });
      };
      recorder.stop();
    },
  },
  mounted() {
    ipcRenderer.on("path::chosen", (e, path) => {
      this.outputVideoPath = path;
    });
    ipcRenderer.on("video::finish", async () => {
      Recorder.stopRecord(this.outputVideoPath, this.saveOnline);
      if (this.saveOnline) {
        const info = `Saved to: ${this.outputVideoPath}`;
        alert(info);
      } else {
        ipcRenderer.send("start::upload");
      }
    });
  }
};
</script>
<style lang="less">
.landing {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__header {
    font-family: "Open Sans Condensed", sans-serif;
    font-size: 4rem;
  }
  &__path {
    margin: 2rem 0;
    display: flex;
    width: 110%;

    &-text {
      flex: 1;
      border: 1px solid gray;
      height: 30px;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    &-button {
      padding: 0 3px;
      border: 1px solid gray;
      border-left: none;
      height: 30px;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      text-transform: uppercase;
      font-size: 1rem;
      font-weight: 700;
    }
  }

  &__options {
    display: flex;
    margin-bottom: 2rem;
    align-items: center;

    & input {
      height: 2.5rem;
      width: 2.5rem;
      margin: 0;
    }
    & label {
      font-size: 1.4rem;
      padding-left: 0.5rem;
      margin: 0;
    }
  }

  &__button {
    width: 25rem;
    height: 4rem;
    border: 0;
    background-color: green;
    text-transform: uppercase;
    color: white;
    font-weight: 900;
    border-radius: 5px;
  }
}
</style>
