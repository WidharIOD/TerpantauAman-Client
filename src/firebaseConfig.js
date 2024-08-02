// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq--jTiluqdG1Z60wVtY4ATU6qXmPi1dM",
  authDomain: "personalproject-52258.firebaseapp.com",
  projectId: "personalproject-52258",
  storageBucket: "personalproject-52258.appspot.com",
  messagingSenderId: "125950891408",
  appId: "1:125950891408:web:31c2d43a1ef316e96c8f15",
  measurementId: "G-BHY6B76TBD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore();

export default db;
