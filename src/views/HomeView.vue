<template>
    <ion-page>
      <ion-grid :fixed="true">
      <ion-row>
        <ion-col size-sm="10" size-md="8" size-lg="6" offset-sm="1" offset-md="2" offset-lg="3">
          <ion-card>
            <ion-card-header>
              <ion-card-title>Geheugentrainer</ion-card-title>
              <ion-card-subtitle>De geheugentrainer helpt je om je geheugen te verbeteren door het spelen van een leuk en uitdagend geheugenspel. Klik op de onderstaande knoppen om in te loggen of een nieuw account aan te maken.</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
        <ion-button @click="goToLogin">Inloggen</ion-button>
        <ion-button @click="goToSignUp">Aanmelden</ion-button>
            </ion-card-content>
          </ion-card>
        </ion-col>

      </ion-row>
    </ion-grid>
    </ion-page>
  </template>
  
  <script lang="ts" setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  function goToLogin() {
    router.push({ path: '/login' });
  }
  
  function goToSignUp() {
    router.push({ path: '/signup' });
  }
  </script>
  