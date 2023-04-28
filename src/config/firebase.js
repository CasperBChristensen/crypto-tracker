import firebase from "firebase/app";
import "firebase/database";

// initialize Firebase
export const firebaseConfig = {
  apiKey: "voHRZenpPaWnknuQiqT8AEcp82TMEtkUCqorwFq2",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://console.firebase.google.com/project/caspers-crypto-corner/database/caspers-crypto-corner-default-rtdb/data/~2F",
  projectId: "caspers-crypto-corner",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "967661283602",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

// get a reference to the database
export const database = firebase.database();