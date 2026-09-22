import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4EosccyXSFpMv35E8Nzh6wijV3YTCRhA",
  authDomain: "jeivan-82577.firebaseapp.com",
  projectId: "jeivan-82577",
  storageBucket: "jeivan-82577.firebasestorage.app",
  messagingSenderId: "198218199725",
  appId: "1:198218199725:web:1bcb01f82b8c4f1a740c24",
  measurementId: "G-1CHT2ZFX1H"
};
const app=initializeApp(firebaseConfig);
export const db=getFirestore(app);export const auth=getAuth(app);
