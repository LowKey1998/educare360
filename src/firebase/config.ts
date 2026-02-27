
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||"AIzaSyAXAnRB28bcBOAHnPfUL14QMV3-3MSOIGE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-6965948217-be25a.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://studio-6965948217-be25a-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-6965948217-be25a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-6965948217-be25a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1074388564494",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1074388564494:web:afa7f5f7a1cfc9e09b5a5f",
};
