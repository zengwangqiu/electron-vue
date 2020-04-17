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
const { ipcRenderer } = window.require("electron");
export default {
  name: "Uploader",
  data() {
    return {
      progress: 0,
      url: "",
    };
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