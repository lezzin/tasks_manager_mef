import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCCUvmSSBbrzpVDoP_hVfiuVJIZXtTEjfQ",
    authDomain: "mentesemflash-c98ec.firebaseapp.com",
    projectId: "mentesemflash-c98ec",
    storageBucket: "mentesemflash-c98ec.firebasestorage.app",
    messagingSenderId: "382344100963",
    appId: "1:382344100963:web:9255cea2170dd7cfef8c56",
    measurementId: "G-WHMCSVMMW2",
};

const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

getAnalytics(app);

export { auth, db, provider };
