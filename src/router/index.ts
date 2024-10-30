import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import GameView from '@/views/GameView.vue';
import LoginView from '@/views/LoginView.vue';
import SignUpView from '@/views/SignupView.vue';
import { auth, firebaseAuthInitialized } from '@/firebase';

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


// Wait for Firebase auth to initialize before handling routes
router.beforeEach(async (to, from, next) => {
  await firebaseAuthInitialized;  // Wait until Firebase auth is initialized
  
  const currentUser = auth.currentUser;

  if (currentUser) {
    // Als de gebruiker is ingelogd, altijd naar /game sturen, behalve als hij al op /game zit
    if (to.path !== '/game') {
      next('/game');
    } else {
      next(); // De gebruiker zit al op /game, ga verder
    }
  } else {
    // Als de gebruiker niet is ingelogd
    if (to.meta.requiresAuth && to.path !== '/home') {
      next('/home'); // Probeer naar een beschermde route te gaan zonder ingelogd te zijn
    } else {
      next(); // Ga door naar de gevraagde route
    }
  }
});

export default router

