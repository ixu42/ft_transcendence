<!-- src/components/menus/MainMenu.vue -->
<template>
    <div class="main-menu">
      <h1>Main Menu</h1>
      <ul>
        <li><router-link to="/lobby">Find Game</router-link></li>
        <li><router-link to="/players">Players</router-link></li>
        <li><router-link to="/leaderboard">Leaderboards</router-link></li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MainMenu',
  };
  </script>
  
  <style scoped>
  /* Add styles here */
  </style>
  