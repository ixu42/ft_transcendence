// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/HomeView.vue';
import Lobby from '../views/LobbyView.vue';
import Game from '../views/GameView.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/lobby', name: 'Lobby', component: Lobby },
  { path: '/game', name: 'Game', component: Game },
  // Add more routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
