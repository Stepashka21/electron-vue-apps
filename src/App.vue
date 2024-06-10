<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
* {
  font-family: "Inter", sans-serif;
  font-weight: 300;
}
body {
  background-color: #A7A7A7;
  align-items: center;
  width: 99vw;   
}
#app {
  background-color: #A7A7A7;
  margin: -9px;
  
}
</style>
