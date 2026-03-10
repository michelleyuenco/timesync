import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpUM-tIDyFHNEdm1gNdIfItQIw7Yzs_SQ",
  authDomain: "timesync-global.firebaseapp.com",
  projectId: "timesync-global",
  storageBucket: "timesync-global.firebasestorage.app",
  messagingSenderId: "278845317837",
  appId: "1:278845317837:web:3e39144e2894b0c61dff84",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
