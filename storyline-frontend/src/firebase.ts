import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: "AIzaSyCdX4EEBysyUOk_65G1peHx61Vp1kwJiy8",
  authDomain: "storyline-erp-push.firebaseapp.com",
  projectId: "storyline-erp-push",
  storageBucket: "storyline-erp-push.firebasestorage.app",
  messagingSenderId: "346455774672",
  appId: "1:346455774672:web:d2c60005aae6ba7732d5d5"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app);
export { getToken, onMessage };
