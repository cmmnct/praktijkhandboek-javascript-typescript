import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const pinia = createPinia();

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(pinia);

router.isReady().then(() => {
  app.mount('#app');
});

// Import individual Ionic components
import { IonicVue, IonInputPasswordToggle, IonButtons, IonIcon, IonList, IonItem, IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol, IonSpinner, IonModal, IonLabel, IonDatetime, IonDatetimeButton, IonAvatar, IonToast } from '@ionic/vue';
import { IonCard, IonCardTitle, IonCardSubtitle, IonCardContent, IonCardHeader } from '@ionic/vue';
import { IonSearchbar, IonAlert } from '@ionic/vue';

// Register Ionic components globally

app.component('ion-alert', IonAlert);
app.component('ion-buttons', IonButtons);
app.component('ion-icon', IonIcon);
app.component('ion-list', IonList);
app.component('ion-item', IonItem);
app.component('ion-page', IonPage);
app.component('ion-header', IonHeader);
app.component('ion-toolbar', IonToolbar);
app.component('ion-title', IonTitle);
app.component('ion-content', IonContent);
app.component('ion-button', IonButton);
app.component('ion-input', IonInput);
app.component('ion-input-password-toggle', IonInputPasswordToggle);
app.component('ion-select', IonSelect);
app.component('ion-select-option', IonSelectOption);
app.component('ion-grid', IonGrid);
app.component('ion-row', IonRow);
app.component('ion-col', IonCol);
app.component('ion-spinner', IonSpinner);
app.component('ion-modal', IonModal);
app.component('ion-label', IonLabel);
app.component('ion-datetime', IonDatetime);
app.component('ion-datetime-button', IonDatetimeButton);
app.component('ion-avatar', IonAvatar);
app.component('ion-toast', IonToast);
app.component('ion-card', IonCard);
app.component('ion-card-title', IonCardTitle);
app.component('ion-card-subtitle', IonCardSubtitle);
app.component('ion-card-header', IonCardHeader);
app.component('ion-card-content', IonCardContent);
app.component('ion-searchbar', IonSearchbar);

import { addIcons } from 'ionicons';
import { personCircleOutline, gridOutline, barChartOutline, peopleOutline,exitOutline } from 'ionicons/icons';

addIcons({
  'person-circle-outline': personCircleOutline,
  'grid-outline': gridOutline,
  'bar-chart-outline': barChartOutline,
  'people-outline': peopleOutline,
  'exit-outline': exitOutline,

});