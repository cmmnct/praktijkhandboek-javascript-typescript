<template>
    <!-- Wacht op tegenstander popup -->
    <ion-modal :is-open="isOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Wachten op uw tegenspeler</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="emits('cancel')">Annuleren</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <p>We wachten op uw tegenspeler om aan te sluiten...</p>
      </ion-content>
    </ion-modal>
  </template>
  
  <script lang="ts" setup>
 const props = defineProps({
    isOpen: Boolean
});
const emits = defineEmits(['cancel'])
    
  </script>
  