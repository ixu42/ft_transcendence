<template>
  <div id="app">
    <AppNavbar />
    <router-view></router-view> <!-- Renders the active route's component -->
  </div>
</template>

<script>
import AppNavbar from './components/shared/AppNavbar.vue';

export default {
  name: 'App',
  components: {
    AppNavbar,
    // Remove unused components if they are not used directly in this template
  },
};
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
