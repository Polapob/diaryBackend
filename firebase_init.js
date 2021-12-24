// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6w_c-RdR5Lo_wo5YCD2cqD6Gf2AT-RQo",
  authDomain: "diaryproject-84f1f.firebaseapp.com",
  projectId: "diaryproject-84f1f",
  storageBucket: "diaryproject-84f1f.appspot.com",
  messagingSenderId: "640802704278",
  appId: "1:640802704278:web:6664cd4fcc4faa4a6d2bb7",
  measurementId: "G-JB0K9B6YD2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);