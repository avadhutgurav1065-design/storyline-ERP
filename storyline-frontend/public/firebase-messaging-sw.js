importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCdX4EEBysyUOk_65G1peHx61Vp1kwJiy8",
  authDomain: "storyline-erp-push.firebaseapp.com",
  projectId: "storyline-erp-push",
  storageBucket: "storyline-erp-push.firebasestorage.app",
  messagingSenderId: "346455774672",
  appId: "1:346455774672:web:d2c60005aae6ba7732d5d5"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    vibrate: [200, 100, 200],
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
