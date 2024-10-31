<!-- components/NotificationComponent.vue -->
<template>
  <div v-for="(notification, index) in notificationStore.notifications" :key="index" class="notification">
    <ion-toast
      :isOpen="true"
      :message="notification.message"
      :color="notification.color"
      :duration="notification.duration"
      position="top"
      layout="stacked"
      class="custom-toast"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '../stores/notificationStore';

const notificationStore = useNotificationStore();
</script>

<style scoped>
.notification {
  margin-bottom: 10px;
  z-index: 1000;
}
.custom-toast {
  z-index: 10000 !important;
}
</style>
