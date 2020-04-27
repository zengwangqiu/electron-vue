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
      <input type="checkbox" id="saveOnline" v-model="saveOnline" @change="change()" />
      <label for="saveOnline">上传到云端</label>
    </section>
    <section>
      <button class="main__button" type="button" @click="startRecord()">开始录制</button>
    </section>
  </div>
</template>

<script>
const { ipcRenderer } = window.require("electron");

export default {
  name: "Main",
  data() {
    return {
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
    change() {
      ipcRenderer.send("choose::save", this.saveOnline);
    }
  },
  mounted() {
    ipcRenderer.on("path::chosen", (e, Path) => {
      this.outputVideoPath = Path;
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
