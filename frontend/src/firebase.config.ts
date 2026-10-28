import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXnJdfX2z2QYaR2eB3ZjcGWUp-cRdgZpk",
  authDomain: "lemamedia-3a199.firebaseapp.com",
  projectId: "lemamedia-3a199",
  storageBucket: "lemamedia-3a199.firebasestorage.app",
  messagingSenderId: "690484945669",
  appId: "1:690484945669:web:ba2212881108cb543f4d6c",
  measurementId: "G-BHXM XDWGV3".replace(" ", "")
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);