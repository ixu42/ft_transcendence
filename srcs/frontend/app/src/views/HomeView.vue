<!-- src/views/Home.vue -->
<template>
    <div>
      <Navbar />
      <MainMenu />
    </div>
  </template>
  
  <script>
  import Navbar from '../components/shared/AppNavbar.vue';
  import MainMenu from '../components/menus/MainMenu.vue';
  
  export default {
    name: 'HomeView',
    components: {
      Navbar,
      MainMenu,
    },
  };
  </script>
  