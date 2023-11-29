// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBK-zpOtv-aygCc5at2FRaKeM-dRqoBrvA",
  authDomain: "social-to-do-a7b05.firebaseapp.com",
  projectId: "social-to-do-a7b05",
  storageBucket: "social-to-do-a7b05.appspot.com",
  messagingSenderId: "648500140998",
  appId: "1:648500140998:web:0423744ef25116fa6ab0c7",
  measurementId: "G-TXR9RLQ82W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app)