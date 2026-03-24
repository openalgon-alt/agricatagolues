import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCNhZuvSQhrj5rzQ08RHO0j7Y5SJrj8Ij0",
  authDomain: "agricatalogues.firebaseapp.com",
  projectId: "agricatalogues",
  storageBucket: "agricatalogues.firebasestorage.app",
  messagingSenderId: "674430985580",
  appId: "1:674430985580:web:a979acc5c087f9c2c8bf49",
  measurementId: "G-HH8J3P8801"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export default app;
