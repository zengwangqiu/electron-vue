<template>
  <div class="control" v-if="starting">
    <button class="control-button" type="button" @click="stopRecord()">停止录制</button>
  </div>
  <div class="control" v-else>
    <button class="control-button" type="button" @click="startRecord()" :disabled="disabled">开始录制</button>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  name: "Control",
  data() {
    return {
      starting: false,
      disabled: false
    };
  },
  methods: {
    startRecord() {
      ipcRenderer.send("arean::chose");
      this.disabled = true;
    },
    stopRecord() {
      ipcRenderer.send("stop::record");
    }
  },
  mounted() {
    ipcRenderer.on("record::start", () => {
      this.starting = true;
    });
  }
};
</script>

<style lang="less">
.control {
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