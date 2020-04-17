<template>
  <div class="recording">
    <p class="recording-text">Click button to stop recording.</p>
    <button class="recording-button" type="button" @click="stopRecord()">Stop recording</button>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
  name: "Recorder",
  data: {},
  methods: {
    stopRecord() {
      ipcRenderer.send("stop::record");
    },
  }
};
</script>

<style lang="less">
.recording {
  &-text {
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
  &-button {
    border-radius: 5px;
    border: 1px solid gray;
    background-color: lightgray;
    height: 30px;
    padding: 0 10px;
    display: flex;
    align-items: center;
  }
}
</style>