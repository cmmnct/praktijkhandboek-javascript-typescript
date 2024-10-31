<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Memory Game</ion-title>
        <ion-buttons slot="end" v-if="!componentState.multiPlayer">
          <ion-button @click="componentState.showUserSettings = true">
            <ion-icon slot="icon-only" name="person-circle-outline"></ion-icon>
          </ion-button>
          <ion-button @click="componentState.showGridSizeSelector = true">
            <ion-icon slot="icon-only" name="grid-outline"></ion-icon>
          </ion-button>
          <!-- Knop voor het openen van het ResultComponent -->
          <ion-button @click="componentState.showResults = true">
            <ion-icon slot="icon-only" name="bar-chart-outline"></ion-icon>
          </ion-button>
          <!-- Knop voor het openen van het InvitationsComponent -->
          <ion-button @click="componentState.showInvitations = true">
            <ion-icon slot="icon-only" name="people-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons  slot="end" v-else>
          <ion-button @click="cancelMultiPlayerGame">
            <ion-icon slot="icon-only" name="exit-outline"></ion-icon>
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
    
    <!-- Modals -->
    <UserSettingsComponent :isOpen="componentState.showUserSettings" :userCredentials="gameStore.userCredentials"
      @close="componentState.showUserSettings = false" @UpdateProfile="updateUserProfile" :onLogout="logout" />
    
    <!-- gridSizeSelector -->
    <ion-modal :is-open="componentState.showGridSizeSelector" @didDismiss="componentState.showGridSizeSelector = false">
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

    <!-- ResultComponent Modal -->
    <ResultsComponent :isOpen="componentState.showResults" :results="gameStore.state.results" @close="cancelMultiPlayerGame" />
    <!-- WaitingComponent Modal -->
    <WaitingComponent :isOpen="componentState.waitingForOpponent" @cancel="componentState.showResults = false" />
    <!-- InvitationsComponent Modal -->
    <InvitationsComponent :isOpen="componentState.showInvitations"
                          :results="multiplayerStore.searchResults"
                          :invitations="multiplayerStore.invitations"
                          @search="handleSearch"
                          @invite="handleInvite"
                          @close="componentState.showInvitations = false"
                          @accept="handleAccept"
                          @decline="handleDecline"
                          @cancel="handleCancel" />

  </ion-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useMultiplayerStore } from '@/stores/multiplayerStore';
import CardComponent from '@/components/CardComponent.vue';
import UserSettingsComponent from '@/components/UserSettingsComponent.vue';
import ResultsComponent from '@/components/ResultsComponent.vue';  // Importeer je ResultComponent
import InvitationsComponent from '@/components/invitationsComponent.vue';  // Importeer je ResultComponent
import WaitingComponent from '@/components/WaitingComponent.vue';  // Importeer je ResultComponent
import { useRouter, useRoute } from 'vue-router';
import { UserCredentials } from '../models/models'

const route = useRoute();
const invitationId = route.params.invitationId; // Haal het invitationId op
const router = useRouter();

const gameStore = useGameStore();
const multiplayerStore = useMultiplayerStore();

const componentState = reactive({
  loading: true,
  showGridSizeSelector: false,
  showUserSettings: false,
  showResults: false,  // Voeg deze toe voor het ResultComponent
  showInvitations: false,  // Voeg deze toe voor het ResultComponent
  multiPlayer:false,
  waitingForOpponent: false,
})
const passwordError = ref('')

async function updateUserProfile(updatedCredentials: UserCredentials, avatarFile?: File) {
  console.log('GameView is calling GameStore updateUserProfile with:', updatedCredentials, avatarFile);
  passwordError.value = '';
  try {
    await gameStore.updateUserProfile(updatedCredentials, avatarFile);
    console.log('UpdateUserProfile successfully executed');
  } catch (error: any) {
    passwordError.value = error.message;
    console.log("updateProfiel says: " + error.message)
  }
}

async function logout() {
  const success = await gameStore.handleAuthentication("logout");
  if (success) {
    router.push({ path: '/login' });
  }
}

const handleCardClick = (index: number) => {
  gameStore.handleCardClick(index);
};

async function handleGridSizeChange(size: number) {
  componentState.showGridSizeSelector = false;
  componentState.loading = true;
  await gameStore.initializeCards(size);
  componentState.loading = false;
}

onMounted(async () => {
  if (route.params.invitationId) {
    // Multiplayer game wordt geladen
    componentState.multiPlayer = true;
    await gameStore.loadState(route.params.invitationId as string);
    componentState.loading = false;
  } else {
    // Single player game
    await gameStore.loadState();
    componentState.loading = false;
    
    // Luister naar updates en navigeer indien nodig
    try {
      const invitationId = await multiplayerStore.listenForInvitationUpdates();
      if (invitationId) {
        router.push({ path: `/game/${invitationId}` });
      }
    } catch (error) {
      console.error("Error listening for invitation updates:", error);
    }
  }
});


// functions for invitations

// Functie om de zoekterm door te geven aan de store
function handleSearch(term: string) {
  console.log('input detected')
  multiplayerStore.searchTerm = term; // Bijwerken van de zoekterm
}

// Functie om een uitnodiging te versturen
async function handleInvite(uid: string) {
  console.log("handleInvite called with uid string: " + uid)
  try {
    await multiplayerStore.sendInvitation(uid);
    console.log(`Uitnodiging verzonden naar ${uid}`);
  } catch (error) {
    console.error("Fout bij het versturen van de uitnodiging:", error);
  }
}

async function handleCancel(invitationId: string) {
  try {
    await multiplayerStore.cancelInvitation(invitationId);
  } catch (error) {
    console.error("Fout bij het annuleren van de uitnodiging:", error);
  }
}

// GameView
async function handleAccept(invitationId: string) {
  await multiplayerStore.acceptInvitation(invitationId);  // Speler 2 accepteert de uitnodiging
  componentState.showInvitations = false;
  router.push(`/game/${invitationId}`);
}

async function startGame(invitationId: string) {
  await multiplayerStore.startGame(invitationId);  // Speler 1 start het spel
  router.push(`/game/${invitationId}`);
}




async function handleDecline(invitationId: string) {
  try {
    await multiplayerStore.declineInvitation(invitationId);
  } catch (error) {
    console.error("Fout bij het afwijzen van de uitnodiging:", error);
  }
}

function cancelMultiPlayerGame() {
  if(confirm("weet je zeker dat je wilt stoppen?")){
    handleCancel(route.params.invitationId as string)
    router.push({ path: `/game` })
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


