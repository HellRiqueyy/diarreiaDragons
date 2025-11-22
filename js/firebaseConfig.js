// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgEX9Dic3R_Yn7gDGTKnRfU5B7IlTcEVw",
  authDomain: "diarreiadragons-ecfe3.firebaseapp.com",
  databaseURL: "https://diarreiadragons-ecfe3-default-rtdb.firebaseio.com",
  projectId: "diarreiadragons-ecfe3",
  storageBucket: "diarreiadragons-ecfe3.firebasestorage.app",
  messagingSenderId: "371490241524",
  appId: "1:371490241524:web:211620bc161577299ed7a1",
  measurementId: "G-H0K5WX5YYK"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };