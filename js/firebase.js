// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlDTpa3kV6-QFO-toYRO6DiS5-88WAwQk",
  authDomain: "eger-kezelo.firebaseapp.com",
  projectId: "eger-kezelo",
  storageBucket: "eger-kezelo.firebasestorage.app",
  messagingSenderId: "1076613883619",
  appId: "1:1076613883619:web:64b94cca3880a89da987d6"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };
