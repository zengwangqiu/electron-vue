<template>
  <div class="recorder-view" ref="recorder">
    <div class="drag"></div>
  </div>
</template>

<script>
// import DraggableResizable from "../components/DraggableResizable.vue";
const win = window.require('electron').remote.getCurrentWindow();

export default {
  name: "Recorder",
  components: {
    // DraggableResizable
  },
  mounted() {
    const el = this.$refs.recorder;
    el.addEventListener('mouseenter', () => {
      win.setIgnoreMouseEvents(true, { forward: true })
    })
    el.addEventListener('mouseleave', () => {
      win.setIgnoreMouseEvents(false)
    })
  }
};
</script>

<style lang="less">
.recorder-view {
  display: flex;
  align-items: center; /*垂直方向居中*/
  justify-content: center; /*水平方向居中*/
  width: 100vw;
  height: 100vh;
  border: 20px dashed red;
  .drag {
    cursor: move;
    width: 20px;
    height: 20px;
    background-color: aqua;
    -webkit-app-region: drag;
  }
}
</style>