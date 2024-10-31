// stores/notificationStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notificationStore', () => {
  const notifications = ref<Array<{ message: string; color: string; duration: number }>>([]);

  const addNotification = (message: string, color: string = 'success', duration: number = 3000) => {
    notifications.value.push({ message, color, duration });
    setTimeout(() => {
      notifications.value.shift();
    }, duration);
  };

  return {
    notifications,
    addNotification,
  };
});

