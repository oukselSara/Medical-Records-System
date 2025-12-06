import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKii4H5YAGWl5M3-Cy67ZOxHlLi8vXBH8",
  authDomain: "medical-records-system-7ce74.firebaseapp.com",
  databaseURL:
    "https://medical-records-system-7ce74-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medical-records-system-7ce74",
  storageBucket: "medical-records-system-7ce74.firebasestorage.app",
  messagingSenderId: "996233029568",
  appId: "1:996233029568:web:f988cfee340e1621324a25",
  measurementId: "G-63BJEVX0X3",
};

/*const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAKii4H5YAGWl5M3-Cy67ZOxHlLi8vXBH8",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebaseapp.com`,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "medical-records-system-7ce74",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebasestorage.app`,
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:996233029568:web:f988cfee340e1621324a25",
};*/

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, auth, db, googleProvider };
