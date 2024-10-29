<template>
    <ion-page>
        <ion-grid :fixed="true">
            <ion-row>
                <ion-col size-sm="10" size-md="8" size-lg="6" offset-sm="1" offset-md="2" offset-lg="3">
                    <ion-card>
                        <ion-card-header>
                            <ion-card-title>Inloggen</ion-card-title>
                            <ion-card-subtitle>Log in om uw spelstatus te herstellen en uw voortgang bij te houden
                            </ion-card-subtitle>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-input placeholder="E-mail" type="email" v-model="email" label="Mailadres: ">
                            </ion-input>
                            <ion-input placeholder="Wachtwoord" type="password" v-model="password" label="Wachtwoord: ">
                            </ion-input>
                            <ion-button @click="login">Inloggen</ion-button>
                            
                            <ion-button @click="router.push('/home')">Terug</ion-button>
                        </ion-card-content>
                    </ion-card>
                </ion-col>
            </ion-row>
        </ion-grid>
    </ion-page>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useRouter } from 'vue-router';
const email = ref('');
const password = ref('');
const gameStore = useGameStore()
const router = useRouter();
const error = ref<string>('');

async function login() {
    console.log('login clicked');
    const success = await gameStore.handleAuthentication('login', email.value, password.value);
    if (success) {
        router.push({ path: '/game' });
    } else {
    error.value = 'Login failed. Please check your credentials.';
  }
}
</script>