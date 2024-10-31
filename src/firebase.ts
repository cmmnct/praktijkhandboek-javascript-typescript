import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDMBclQnPZrcNsevFZ0IYgTMC_0yzv-74w",
    authDomain: "memory-game-10538.firebaseapp.com",
    projectId: "memory-game-10538",
    storageBucket: "memory-game-10538.appspot.com",
    messagingSenderId: "1089085032321",
    appId: "1:1089085032321:web:f7680e66059670f1db8a80"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Wait for Firebase to initialize the auth state
export const firebaseAuthInitialized = new Promise((resolve, reject) => {
  onAuthStateChanged(auth, user => {
    resolve(user);  // Resolve the promise when Firebase is done
  }, reject);
});

// Stel de persistentie in (local storage)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence is set to local');
  })
  .catch((error) => {
    console.error('Failed to set persistence:', error);
  });


console.log('Current user at start:', auth.currentUser);