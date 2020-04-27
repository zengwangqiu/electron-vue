<template>
  <div class="move">
    <img src="../../public/move.png" width="32px" height="32px" />
  </div>
</template>

<script>
// const { ipcRenderer } = window.require("electron");
export default {
  name: "Control",
  data() {
    return {

    };
  },
  methods: {

  },
  mounted() {

  }
};
</script>

<style lang="less">
.move {
  cursor: move;
  width: 32px;
  height: 32px;
  -webkit-app-region: drag;
}
</style>