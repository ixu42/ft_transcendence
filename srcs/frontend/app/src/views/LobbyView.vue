<!-- src/views/Lobby.vue -->
<template>
    <div>
      <Navbar />
      <h2>Game Lobby</h2>
      <!-- Lobby content goes here -->
    </div>
  </template>
  
  <script>
  import Navbar from '../components/shared/AppNavbar.vue';
  
  export default {
    name: 'LobbyView',
    components: {
      Navbar,
    },
  };
  </script>
  