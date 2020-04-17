<template>
  <div class="uploader">
    <p>
      Saved to local directory. Now uploading:
      <span>{{ progress }}%</span>
    </p>
    <p>
      Url:
      <span>{{ url }}</span>
    </p>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
  name: "Uploader",
  data: {
    progress: 0,
    url: "",
  },
  mounted() {
    ipcRenderer.on("upload::progress", (e, progress) => {
      console.log(e, progress);
      this.progress = progress;
    });
    ipcRenderer.on("upload::finish", (e, url) => {
      this.url = url;
    });
  },
};
</script>

<style lang="less">
.uploader {
  font-size: 1.3rem;
}
</style>