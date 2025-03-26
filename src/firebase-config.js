import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Assurez-vous que ces valeurs sont correctes et correspondent à votre projet Firebase
  apiKey: "votre-api-key",
  authDomain: "votre-auth-domain",
  projectId: "votre-project-id",
  storageBucket: "votre-storage-bucket",
  messagingSenderId: "votre-messaging-sender-id",
  appId: "votre-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 