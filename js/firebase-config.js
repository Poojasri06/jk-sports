// ════════════════════════════════════════════════════════════
// FIREBASE CONFIG — fill these in from:
// Firebase Console → Project Settings → General → Your apps → Web app
// (See SETUP.md, Step 8)
// ════════════════════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKo6pWYFAZv5Bp4PX5_9FCMz7htlI5DNI",
  authDomain: "jk-sports-f263d.firebaseapp.com",
  projectId: "jk-sports-f263d",
  storageBucket: "jk-sports-f263d.firebasestorage.app",
  messagingSenderId: "232673809387",
  appId: "1:232673809387:web:dcb4606e40897109753fae",
  measurementId: "G-1S2GG47YEF"
}
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functionsClient = getFunctions(app); // default region us-central1
export const auth = getAuth(app);
