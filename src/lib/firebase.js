import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDyIXwgVhahQPrYP10yMI_5FSWIqk1oXYE",
  authDomain: "wabsite-for-game.firebaseapp.com",
  projectId: "wabsite-for-game",
  storageBucket: "wabsite-for-game.firebasestorage.app",
  messagingSenderId: "773318528270",
  appId: "1:773318528270:web:2360ae83bf4135cf179b5f",
  measurementId: "G-HYC017NG0V"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
