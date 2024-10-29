<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Memory Game</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="componentState.showUserSettings = true">
                        <ion-icon slot="icon-only" name="person-circle-outline"></ion-icon>
                    </ion-button>
                    <ion-button @click="componentState.showGridSizeSelector = true">
                        <ion-icon slot="icon-only" name="grid-outline"></ion-icon>
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content>
            <div v-if="gameStore.state" class="game-grid">
                <CardComponent v-for="(card, index) in gameStore.state.cards" :key="`${card.set}-${card.name}-${index}`"
                    :card="card" :class="`grid${gameStore.state.gridSize}`" @click="handleCardClick(index)" />
            </div>
            <ion-spinner v-else />
        </ion-content>
        <UserSettingsComponent :isOpen="componentState.showUserSettings"
:userCredentials="gameStore.userCredentials"
@close="componentState.showUserSettings = false"
@UpdateProfile="updateUserProfile"
:onLogout="logout"
/>
        <!-- Modals -->
        <!-- gridSizeSelector -->
        <ion-modal :is-open="componentState.showGridSizeSelector"
            @didDismiss="componentState.showGridSizeSelector = false">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Selecteer Grid Grootte</ion-title>
                    <ion-buttons slot="end">
                        <ion-button @click="componentState.showGridSizeSelector = false">Sluiten</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <ion-list>
                    <ion-item button @click="handleGridSizeChange(16)">4x4</ion-item>
                    <ion-item button @click="handleGridSizeChange(25)">5x5</ion-item>
                    <ion-item button @click="handleGridSizeChange(36)">6x6</ion-item>
                </ion-list>
            </ion-content>
        </ion-modal>
        
    </ion-page>
</template>
<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { useGameStore } from '@/stores/gameStore';
import CardComponent from '@/components/CardComponent.vue';
import UserSettingsComponent from '@/components/UserSettingsComponent.vue'
const gameStore = useGameStore();
const loading = ref(true);
const componentState = reactive({
    loading: true,
    showGridSizeSelector: false,
    showUserSettings: false
})
const router = useRouter();
const passwordError = ref();

onMounted(async () => {
    await gameStore.loadState();
    loading.value = false;
    console.log('GameView loaded state:', gameStore.state);
});

const handleCardClick = (index: number) => {
    gameStore.handleCardClick(index);
};

async function handleGridSizeChange(size: number) {
componentState.showGridSizeSelector = false;
componentState.loading = true;
await gameStore.initializeCards(size);
componentState.loading = false;
}

async function updateUserProfile(updatedCredentials: UserCredentials, avatarFile?: File) {

// we kunnen een aantal console.log statements toevoegen voor debugging
console.log('GameView is calling GameStore updateUserProfile with:',
updatedCredentials, avatarFile);
passwordError.value = '';
try {
await gameStore.updateUserProfile(updatedCredentials, avatarFile);
console.log('UpdateUserProfile successfully executed');
} catch (error: any) {
passwordError.value = error.message;
console.log('updateProfiel says: ' + error.message)
}
}
async function logout() {
const success = await gameStore.handleAuthentication("logout");
if (success) {
router.push({ path: '/login' });
}
}

</script>
<style scoped>
.game-grid {
    display: flex;
    flex-wrap: wrap;
    width: 100vw;
    max-width: 900px;
    margin: auto;
    justify-content: center;
}

.game-grid>div {
    margin: min(1vw, 10px);
}

.grid16 {
    max-width: calc(25% - 2vw);
}

.grid25 {
    max-width: calc(20% - 2vw);
}

.grid36 {
    max-width: calc(16.6666% - 2vw);
}
</style>