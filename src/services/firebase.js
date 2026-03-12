import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCedcTzrFvO-4XOWRq-7JrmiYw5pQEVViU",
  authDomain: "piggy-app-7f42d.firebaseapp.com",
  projectId: "piggy-app-7f42d",
  storageBucket: "piggy-app-7f42d.firebasestorage.app",
  messagingSenderId: "1046144368349",
  appId: "1:1046144368349:web:cf026a7139d4ec3ec82534",
  measurementId: "G-YXSKM4BLL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, getDoc, onSnapshot };
