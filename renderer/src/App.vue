<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="less">
*,
*::after,
*::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  // default browser font size is 16px
  // convert it to 10 px for convienient
  // so 1 rem is 10 px
  font-size: 62.5%;
}

body {
  overflow: hidden;
  background: none;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Lato", sans-serif;
}

button {
  cursor: pointer;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

a {
  text-decoration: none;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
