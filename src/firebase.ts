import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
    apiKey: "AIzaSyDRmdYA0HRTDjz2vVaFQAoQ-CD5Hb_52oU",
    authDomain: "memorytrainer-24102024.firebaseapp.com",
    projectId: "memorytrainer-24102024",
    storageBucket: "memorytrainer-24102024.appspot.com",
    messagingSenderId: "434316144954",
    appId: "1:434316144954:web:d39318bf5fd5b8b05a2003",
    measurementId: "G-PPCQBDYGW0"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Stel de persistentie in (local storage)
setPersistence(auth, browserLocalPersistence)
.then(() => {
console.log('Firebase Auth persistence is set to local');
})
.catch((error) => {
console.error('Failed to set persistence:', error);
});

// firebase.ts
export const firebaseAuthInitialized = new Promise((resolve, reject) => {
    onAuthStateChanged(auth, user => {
      resolve(user);  // Resolve the promise when Firebase is done
    }, reject);
  });
  