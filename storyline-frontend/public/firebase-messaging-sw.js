importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const urlParams = new URLSearchParams(location.search);
const configParam = urlParams.get('config');

let firebaseConfig;
if (configParam) {
  firebaseConfig = JSON.parse(decodeURIComponent(configParam));
} else {
  // Fallback for direct loads without config
  firebaseConfig = {};
}

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
