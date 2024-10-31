<template>

  <ion-modal :is-open="isOpen" @didDismiss="close">
    <ion-header>
      <ion-toolbar>
        <ion-title>Gebruikersinstellingen</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="close">Sluiten</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form>
        <ion-list>
          <!-- Gebruikersnaam en Avatar -->
          <ion-item>
            <ion-label position="stacked">Gebruikersnaam</ion-label>
            <ion-input v-model="myUserCredentials.displayName" @input="atSettingsChange"
              placeholder="Voer je gebruikersnaam in"></ion-input>
            <ion-avatar @click="triggerFileUpload" style="cursor: pointer;" slot="end">
              <img :src="myUserCredentials.avatarUrl" alt="Avatar">
            </ion-avatar>
            <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" />
          </ion-item>
          
          <!-- Geboortedatum -->
          <ion-item>
            <ion-label position="stacked">Geboortedatum</ion-label><br>
            <ion-datetime-button datetime="datetime"></ion-datetime-button><br>
            <ion-modal :keep-contents-mounted="true">
              <ion-datetime id="datetime" v-model="myUserCredentials.birthdate" display-format="YYYY-MM-DD"
                presentation="date" @ionChange="atSettingsChange"></ion-datetime>
            </ion-modal>
          </ion-item>
        </ion-list>

        <!-- Update Profiel Knop -->
        <ion-button expand="block" @click="handleUpdateProfile()" :disabled="submitDisabled">Update Profiel</ion-button>

        <!-- Wachtwoord wijzigen -->
        <ion-list v-if="changePassword">
          <ion-item>
            <ion-label position="stacked">Oude wachtwoord</ion-label>
            <ion-input type="password" v-model="myUserCredentials.oldPassword" @input="checkPasswords"
              onkeypress="return event.charCode != 32" placeholder="Voer je oude wachtwoord in">
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Nieuwe wachtwoord</ion-label>
            <ion-input type="password" v-model="myUserCredentials.newPassword" @input="checkPasswords"
              onkeypress="return event.charCode != 32" placeholder="Voer je nieuwe wachtwoord in">
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
          <ion-item v-if="passwordError && changePassword">
            <p style="color: red; font-weight: bold;">{{ passwordError }}</p>
          </ion-item>
          <ion-grid>
            <ion-row>
              <ion-col>
                <ion-button expand="block" @click="cancelPasswordChange">Cancel</ion-button>
              </ion-col>
              <ion-col>
                <ion-button expand="block" :disabled="!checkPasswords()" @click="handleUpdateProfile()">Update Wachtwoord</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-list>
        <ion-button v-else expand="block" @click="changePassword = true">Update wachtwoord</ion-button>

        <!-- Uitloggen -->
        <ion-button expand="block" color="warning" @click="handleLogout">Uitloggen</ion-button>
      </form>
    </ion-content>
  </ion-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watchEffect } from 'vue';
import { UserCredentials } from '../models/models';

const props = defineProps<{
  isOpen: boolean;
  userCredentials: UserCredentials;
  onLogout: () => void;
}>();
const emit = defineEmits(['close', 'updateProfile']);
const submitDisabled = ref(true);
const myUserCredentials = reactive<UserCredentials>({
  displayName: '',
  oldPassword: '',
  newPassword: '',
  birthdate: '',
  avatarUrl: '',
});
const fileInput = ref<HTMLInputElement | null>(null);
const avatarFile = ref<File | null>(null);
const changePassword = ref(false);
const passwordError = ref('');

// Synchroniseer myUserCredentials met props.userCredentials wanneer props.userCredentials verandert
watchEffect(() => {
  console.log('user credentials synchonised, wathceffect')
  Object.assign(myUserCredentials, JSON.parse(JSON.stringify(props.userCredentials)));
  submitDisabled.value = true; // Reset de status van de submit knop
});

function triggerFileUpload() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

function atSettingsChange() {
  submitDisabled.value = false; // Zorg ervoor dat de submit knop actief wordt bij wijzigingen
}

function close() {
  emit('close');
  resetState();
}

function resetState() {
  submitDisabled.value = true;
  changePassword.value = false;
  passwordError.value = '';
  myUserCredentials.oldPassword = '';
  myUserCredentials.newPassword = '';
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    avatarFile.value = target.files[0];
    myUserCredentials.avatarUrl = URL.createObjectURL(avatarFile.value);
    atSettingsChange(); // Activeer de submit knop
  }
};

function handleUpdateProfile() {
  console.log("Profiel wordt bijgewerkt:", myUserCredentials);
  if (changePassword.value) {
    if (!checkPasswords()) return;
  }
  emit('updateProfile', myUserCredentials, avatarFile.value);
  submitDisabled.value = true;
}

function checkPasswords(): boolean {
  if (myUserCredentials.oldPassword && myUserCredentials.newPassword && myUserCredentials.oldPassword !== myUserCredentials.newPassword) {
    passwordError.value = '';
    return true;
  } else {
    passwordError.value = 'Vul uw oude wachtwoord in en een nieuw wachtwoord. Het oude en nieuwe mogen niet gelijk zijn';
    return false;
  }
}

function cancelPasswordChange() {
  changePassword.value = false;
  myUserCredentials.oldPassword = '';
  myUserCredentials.newPassword = '';
}

function handleLogout() {
  props.onLogout();
  close();
}
</script>
