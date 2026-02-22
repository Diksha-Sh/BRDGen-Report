import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAG--fVKiWfezMp0psm3dzWblS4Aaj-av0",
    authDomain: "brdgen-439b1.firebaseapp.com",
    projectId: "brdgen-439b1",
    storageBucket: "brdgen-439b1.firebasestorage.app",
    messagingSenderId: "593629223731",
    appId: "1:593629223731:web:c35806ffdc2cc20f4d7c46",
    measurementId: "G-TPSND38PFE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
