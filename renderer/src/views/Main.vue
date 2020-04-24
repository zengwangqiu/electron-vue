<template>
  <div class="main">
    <header>
      <h1 class="main__header">录屏</h1>
    </header>
    <section class="main__path">
      <div class="main__path-text">
        <span>{{ outputVideoPath }}</span>
      </div>
      <button class="main__path-button" type="button" @click="openDialog()">选择保存路径</button>
    </section>
    <section class="main__options">
      <input type="checkbox" id="saveOnline" v-model="saveOnline" />
      <label for="saveOnline">上传到云端</label>
    </section>
    <section>
      <button class="main__button" type="button" @click="startRecord()">开始录制</button>
    </section>
    <div style="overflow: hidden;" class="canvas">
      <p>预览：</p>
      <canvas :width="this.arean.width+'px'" :height="this.arean.height+'px'" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
const path = window.require("path");
const exec = window.require("child_process").exec;
const fs = window.require("fs");
const { ipcRenderer, desktopCapturer } = window.require("electron");

let recorder;
let blobs = [];
let tracks;
let timer;
export default {
  name: "Main",
  data() {
    return {
      arean: { x: 0, y: 0, width: 384, height: 216 },
      outputVideoPath: "",
      saveOnline: false,
      justSaved: false
    };
  },


  methods: {
    openDialog() {
      ipcRenderer.send("pick::path");
    },
    startRecord() {
      if (this.outputVideoPath) {
        ipcRenderer.send("start::record");
      } else alert("请先选择保存路径!");
    },
    start() {
      desktopCapturer
        .getSources({ types: ["screen"] })
        .then(async sources => {
          await navigator.webkitGetUserMedia(
            {
              cursor: "never",
              audio: {
                mandatory: {
                  chromeMediaSource: "desktop",
                }
              },
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
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
    handleStream(screenStream) {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      tracks = screenStream.getTracks();

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      const screenAudioTrack = screenStream.getAudioTracks()[0];
      const imageCapture = new ImageCapture(screenVideoTrack);
      this.handleImage(ctx, imageCapture);
      const options = {
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
        mimeType: "video/webm",
      };
      const canvasStream = canvas.captureStream(100);
      const canvasVideoTrack = canvasStream.getVideoTracks()[0];

      const mediaStream = new MediaStream([canvasVideoTrack]);
      mediaStream.addTrack(screenAudioTrack);
      recorder = new MediaRecorder(screenStream, options);
      blobs = [];
      recorder.ondataavailable = function (event) {
        blobs.push(event.data);
      };
      recorder.start();
    },
    handleImage(ctx, imageCapture) {
      const self = this;
      imageCapture.grabFrame().then(imageBitmap => {
        ctx.drawImage(
          imageBitmap,
          this.arean.x,
          this.arean.y,
          this.arean.width,
          this.arean.height,
          0,
          0,
          this.arean.width,
          this.arean.height
          // this.canvasWidth, this.canvasHeight
        );
        timer = setTimeout(function () {
          self.handleImage(ctx, imageCapture);
        }, 0);
      });
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
      const self = this;
      const ffmpegPath = path.join(self.$appPath, "ffmpeg.exe");
      recorder.onstop = () => {
        self.toArrayBuffer(new Blob(blobs, { type: "video/webm" }), chunk => {
          const buffer = self.toBuffer(chunk);
          const randomString = Math.random()
            .toString(36)
            .substring(7);
          const randomName = randomString + "-shot.webm";
          const mpath = path.join(userPath, randomName);
          fs.writeFile(mpath, buffer, function (err) {
            if (!err) {
              console.log(
                "Saved video: " + mpath,
                "do save online?",
                saveOnline
              );

              exec(
                `${ffmpegPath} -i ${mpath} -vf crop=${self.arean.width -
                5}:${self.arean.height - 5}:${self.arean.x + 3}:${self.arean
                  .y + 3} -vcodec h264 ${path.join(
                    userPath,
                    randomString + ".mp4"
                  )}`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.log(error);
                    return;
                  }
                }
              );
              if (saveOnline) {
                alert("功能暂未实现!");
                // console.log("save online");
                // const buff = Buffer.from(buffer).toString("base64");
                // $http({
                //   method: "POST",
                //   url: "https://api.cloudinary.com/v1_1/dyqhomagf/upload",
                //   data: {
                //     upload_preset: "bsfgxm61",
                //     file: "data:video/webm;base64," + buff
                //   },
                //   uploadEventHandlers: {
                //     progress: function (e) {
                //       console.log(e);
                //       if (e && e.total && e.loaded) {
                //         const progress = Math.floor((e.loaded / e.total) * 100);
                //         ipcRenderer.send("upload::progress", progress);
                //       }
                //     }
                //   }
                // })
                //   .then(function (res) {
                //     console.log("Saved online", res.data.secure_url);
                //     ipcRenderer.send("upload::finish", res.data.secure_url);
                //   })
                //   .catch(function (err) {
                //     console.log("Error saving online", err);
                //   });
              }
            } else {
              alert("Failed to save video " + err);
            }
          });
        });
      };
      clearTimeout(timer);
      recorder.stop();
      tracks.forEach(track => track.stop());
    }
  },
  mounted() {
    ipcRenderer.on("path::chosen", (e, path) => {
      this.outputVideoPath = path;
    });

    ipcRenderer.on("arean::size", (e, arean) => {
      this.arean = arean;
    });

    ipcRenderer.on("arean::move", (e, arean) => {
      this.arean = arean;
    });

    ipcRenderer.on("video::finish", async () => {
      this.stopRecord(this.outputVideoPath, this.saveOnline);
      if (!this.saveOnline) {
        const info = `Saved to: ${this.outputVideoPath}`;
        alert(info);
      } else {
        ipcRenderer.send("start::upload");
      }
    });

    ipcRenderer.on("start::record", () => {
      this.start();
      ipcRenderer.send("record::start");
    });
  }
};
</script>
<style lang="less">
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .canvas {
    height: 0;
    width: 0;
  }
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
