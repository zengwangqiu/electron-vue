<template>
  <div class="control">
    <div v-if="creating" class="control-tip">视频生成中...</div>
    <div v-else>
      <button
        :disabled="creating"
        v-if="starting"
        class="control-button"
        type="button"
        @click="stopRecord()"
      >停止录制</button>
      <button
        v-else
        class="control-button"
        type="button"
        @click="startRecord()"
        :disabled="disabled"
      >开始录制</button>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");
export default {
  name: "Control",
  data() {
    return {
      starting: false,
      disabled: false,
      creating: false,
    };
  },
  methods: {
    startRecord() {
      ipcRenderer.send("arean::chose");
      this.disabled = true;
      this.starting = true;
    },
    stopRecord() {
      ipcRenderer.send("stop::record");
    }
  },
  mounted() {
    ipcRenderer.on("video::creating", () => {
      this.creating = true;
    })
  }
};
</script>

<style lang="less">
.control {
  &-tip {
    font-size: 150%;
  }
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