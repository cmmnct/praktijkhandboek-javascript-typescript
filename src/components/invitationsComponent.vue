<template>
    <ion-modal :is-open="isOpen" @didDismiss="emits('close')">
        <ion-header>
            <ion-toolbar>
                <ion-title>Zoek Gebruikers</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="emits('close')">Sluiten</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <!-- Zoek input -->
            <ion-searchbar v-model="searchTerm" @ionInput="emits('search', searchTerm)"
                placeholder="Zoek naar gebruikers" />

            <!-- Resultaten -->
            <ion-list>
                <ion-item v-for="user in results" :key="user.uid">
                    <ion-label>{{ user.displayName }}, {{ user.uid }}</ion-label>
                    <ion-button @click="emits('invite', user.uid)">Uitnodigen</ion-button>
                </ion-item>
            </ion-list>

            <!-- Inkomende uitnodigingen -->
<h2>Inkomende Uitnodigingen</h2>
<ion-list>
  <ion-item v-for="invitation in incomingInvitations" :key="invitation.id">
    <ion-label>{{ invitation.inviter.displayName }} heeft je uitgenodigd!</ion-label>
    <ion-button @click="emits('accept', invitation.id)">Accepteren</ion-button>
    <ion-button @click="confirmDecline(invitation.id)" color="danger">Weigeren</ion-button>
  </ion-item>
</ion-list>

<!-- Uitgaande uitnodigingen -->
<h2>Uitgaande Uitnodigingen</h2>
<ion-list>
  <ion-item v-for="invitation in outgoingInvitations" :key="invitation.id">
    <ion-label>Uitnodiging naar {{ invitation.invitee.displayName }} verstuurd</ion-label>
    <ion-button @click="confirmCancel(invitation.id)" color="danger">Annuleren</ion-button>
  </ion-item>
</ion-list>

        </ion-content>
    </ion-modal>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import { User, MultiplayerInvitation } from '@/models/models';

const props = defineProps({
    isOpen: Boolean,
    results: {
        type: Array as () => User[],
        default: () => [],
    },
    invitations: {
        type: Array as () => MultiplayerInvitation[],
        default: () => [],
    },
});

const emits = defineEmits(['close', 'search', 'invite', 'cancel', 'decline', 'accept']);

// Computed properties voor inkomende en uitgaande uitnodigingen
const incomingInvitations = computed(() => props.invitations.filter(invitation => 
invitation.direction === 'incoming' && invitation.status !== 'declined'));
const outgoingInvitations = computed(() => props.invitations.filter(invitation => invitation.direction === 'outgoing' && invitation.status !== 'declined'));

const confirmDecline = (invitationId:string ) => {
if(confirm('weet u het zeker')) emits('decline', invitationId)
}
const confirmCancel = (invitationId:string ) => {
if(confirm('weet u het zeker')) emits('cancel', invitationId)
}

// Zoekterm in een lokale ref
const searchTerm = ref('');
</script>