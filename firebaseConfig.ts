// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRmdYA0HRTDjz2vVaFQAoQ-CD5Hb_52oU",
  authDomain: "memorytrainer-24102024.firebaseapp.com",
  projectId: "memorytrainer-24102024",
  storageBucket: "memorytrainer-24102024.appspot.com",
  messagingSenderId: "434316144954",
  appId: "1:434316144954:web:d39318bf5fd5b8b05a2003",
  measurementId: "G-PPCQBDYGW0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const fireStore = getFirestore(app);

export {auth, fireStore}