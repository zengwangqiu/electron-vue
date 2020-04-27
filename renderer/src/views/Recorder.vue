<template>
  <div class="recorder-view" ref="recorder" :style="{borderColor: transparent}">
    <div class="mask" v-if="N">
      <div v-if="!chose">录制区域</div>
      <div v-else>
        {{N}}秒后开始
        <br />Ctrl + S 结束录制
      </div>
    </div>
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
const borgerWidth = 1;
let recorder;
let blobs = [];
let tracks;
let timer;
const win = window.require('electron').remote.getCurrentWindow();
// import DraggableResizable from "../components/DraggableResizable.vue";

export default {
  name: "Recorder",
  components: {
    // DraggableResizable
  },
  data() {
    return {
      arean: { x: 0, y: 0, width: 384, height: 216 },
      N: 3,
      chose: false,
      transparent: ""
    }
  },
  methods: {
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
              ipcRenderer.send("recorder::faild");
            }
          );
        })
        .catch(error => {
          ipcRenderer.send("recorder::faild");
        });
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
        videoBitsPerSecond: 250000000,
        mimeType: "video/webm",
      };
      const canvasStream = canvas.captureStream(100);
      const canvasVideoTrack = canvasStream.getVideoTracks()[0];

      const mediaStream = new MediaStream([canvasVideoTrack]);
      mediaStream.addTrack(screenAudioTrack);
      recorder = new MediaRecorder(mediaStream, options);
      blobs = [];
      recorder.ondataavailable = function (event) {
        blobs.push(event.data);
      };
      recorder.start();
      ipcRenderer.send("recorder::start");
    },
    handleImage(ctx, imageCapture) {
      const self = this;
      imageCapture.grabFrame().then(imageBitmap => {
        // ctx.clearRect(
        //   0,
        //   0,
        //   this.arean.width,
        //   this.arean.height,
        // )
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
    stopRecord(userPath, saveOnline, ffmpegPath) {
      const self = this;
      recorder.onstop = () => {
        ipcRenderer.send("recorder::end");
        self.toArrayBuffer(new Blob(blobs, { type: "video/webm" }), chunk => {
          const buffer = self.toBuffer(chunk);
          const randomString = Math.random()
            .toString(36)
            .substring(7);
          const webmName = randomString + "-shot.webm";
          const mp4Name = randomString + ".mp4";
          const webmPath = path.join(userPath, webmName);
          const mp4Path = path.join(userPath, mp4Name);
          fs.writeFile(webmPath, buffer, function (err) {
            if (!err) {
              exec(
                `${ffmpegPath} -i ${webmPath} -vcodec h264 ${mp4Path}`,
                (error, stdout, stderr) => {
                  if (error) {
                    ipcRenderer.send("video::finished", "Failed to save video");
                    return;
                  } else {
                    ipcRenderer.send("video::finished", `saved as:\n ${webmName} \n ${mp4Name}`);
                  }
                }
              );
              if (saveOnline) {
                alert("功能暂未实现!");
                ipcRenderer.send("start::upload");
                // const buff = Buffer.from(buffer).toString("base64");
                // $axios({
                //   method: "POST",
                //   url: "http://localhost:3000/upload",
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
              ipcRenderer.send("video::finished", "Failed to save video");
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
    const self = this;
    const el = self.$refs.recorder;
    el.addEventListener('mouseenter', () => {
      win.setIgnoreMouseEvents(true, { forward: true })
    })
    el.addEventListener('mouseleave', () => {
      win.setIgnoreMouseEvents(false)
    })

    ipcRenderer.on("arean::size", (e, arean) => {
      arean.x += borgerWidth;
      arean.y += borgerWidth;
      arean.width -= borgerWidth * 2;
      arean.height -= borgerWidth * 2;
      self.arean = arean;
    });

    ipcRenderer.on("arean::move", (e, arean) => {
      arean.x += borgerWidth;
      arean.y += borgerWidth;
      arean.width -= borgerWidth * 2;
      arean.height -= borgerWidth * 2;
      self.arean = arean;
    });

    ipcRenderer.on("stop::record", async (e, outputVideoPath, saveOnline, ffmpegPath) => {
      self.stopRecord(outputVideoPath, saveOnline, ffmpegPath);
    });

    ipcRenderer.on("arean::chose", async () => {
      self.chose = true;
      while (self.N > 0) {
        await new Promise(resove => {
          setTimeout(() => {
            self.N--;
            resove();
          }, 1000)
        })
      }
      self.start();
    });
  }
};
</script>

<style lang="less">
.recorder-view {
  .mask {
    display: flex;
    align-items: center; /*垂直方向居中*/
    justify-content: center;
    position: absolute;
    background-color: rgba(83, 81, 81, 0.9);
    font-size: 500%;
    color: aquamarine;
    width: 100vw;
    height: 100vh;
  }
  .canvas {
    height: 0;
    width: 0;
  }
  display: flex;
  align-items: center; /*垂直方向居中*/
  justify-content: center; /*水平方向居中*/
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  border: 1px dashed rgb(250, 123, 123);
}
</style>