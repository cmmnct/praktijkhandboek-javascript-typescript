<template>
  <ion-app>
    <NotificationComponent />
    <ion-router-outlet />
    
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { fetchCards } from '@/services/apiService';
import { onMounted } from 'vue';
import NotificationComponent from '@/components/NotificationComponent.vue';

onMounted(async ()=> await fetchCards())
</script>
