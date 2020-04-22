<template>
  <div class="recording" v-if="starting">
    <p class="recording-text">Click button to stop recording.</p>
    <button class="recording-button" type="button" @click="stopRecord()">Stop recording</button>
  </div>
  <div class="recording" v-else>
    <p class="recording-text">Click button to choose arean.</p>
    <button
      class="recording-button"
      type="button"
      @click="startRecord()"
      :disabled="disabled"
    >Start recording</button>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  name: "Recorder",
  data() {
    return {
      starting: false,
      disabled: false,
    };
  },
  methods: {
    startRecord() {
      ipcRenderer.send("arean::chose");
      this.disabled = true;
    },
    stopRecord() {
      ipcRenderer.send("stop::record");
    },
  },
  mounted() {
    ipcRenderer.on("record::start", () => {
      this.starting = true;
    })
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