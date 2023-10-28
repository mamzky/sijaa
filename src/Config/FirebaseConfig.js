// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from '@firebase/firestore'
// import firebase from "firebase";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDMw5cQxjjBBrcZSzox9LAa0oWpIV8tWRE",
  authDomain: "sijaa-ca714.firebaseapp.com",
  databaseURL: "https://sijaa-ca714-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sijaa-ca714",
  storageBucket: "sijaa-ca714.appspot.com",
  messagingSenderId: "747878712791",
  appId: "1:747878712791:web:25c221b02102e0986db792",
  measurementId: "G-1YVEJD6XYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)