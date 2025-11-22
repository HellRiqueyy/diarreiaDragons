// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAp8cJpiKIJh0ooXacZjItLrCsq4FfutPc",
  authDomain: "diarreiadragons-aafc1.firebaseapp.com",
  projectId: "diarreiadragons-aafc1",
  storageBucket: "diarreiadragons-aafc1.firebasestorage.app",
  messagingSenderId: "612959412660",
  appId: "1:612959412660:web:f2969c4e8f70a62e3812e1",
  measurementId: "G-89WNDCZG9Q"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, app };