import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';
import LoginView from '@/views/LoginView.vue';
import SignUpView from '@/views/SignupView.vue';

const routes = [
  {
  path: '/',
  redirect: '/home',
  },
  {
  path: '/home',
  component: HomeView,
  },
  {
  path: '/game',
  component: GameView,
  meta: {
  requiresAuth: true,
  },
  },
  {
  path: '/login',
  component: LoginView,
  },
  {
  path: '/signup',
  component: SignUpView,
  }
  ];
const router = createRouter({
history: createWebHistory(import.meta.env.BASE_URL),
routes
})
export default router