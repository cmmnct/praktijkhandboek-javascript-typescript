import { createRouter, createWebHistory } from '@ionic/vue-router';
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
    path: '/game/:invitationId', // Dynamische route voor specifieke spellen
    component: GameView, // Als je dezelfde component gebruikt voor /game en /game/:invitationId
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    component: LoginView,
  },
  {
    path: '/signup',
    component: SignUpView,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/game', // Onbekende routes naar /game sturen als gebruiker ingelogd is
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Wait for Firebase auth to initialize before handling routes
router.beforeEach(async (to, from, next) => {
  await firebaseAuthInitialized;  // Wacht totdat Firebase auth is geïnitialiseerd
  
  const currentUser = auth.currentUser;

  if (currentUser) {
    // Controleer of de route een dynamische game route is met een invitationId
    const isGameRoute = to.path.startsWith('/game') && to.params.invitationId;

    if (to.path === '/game' || isGameRoute) {
      next(); // Sta de gebruiker toe om naar /game of /game/:invitationId te navigeren
    } else {
      // Gebruiker is ingelogd, maar navigeert naar een andere route, stuur naar /game
      next('/game');
    }
  } else {
    // Als de gebruiker niet is ingelogd en een route met auth probeert te bezoeken
    if (to.meta.requiresAuth) {
      next('/home'); // Stuur naar home als de route beveiligd is
    } else {
      next(); // Ga door naar de gevraagde route
    }
  }
});



export default router;
