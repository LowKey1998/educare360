
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAXAnRB28bcBOAHnPfUL14QMV3-3MSOIGE",
  authDomain: "studio-6965948217-be25a.firebaseapp.com",
  projectId: "studio-6965948217-be25a",
  storageBucket: "studio-6965948217-be25a.firebasestorage.app",
  messagingSenderId: "1074388564494",
  appId: "1:1074388564494:web:afa7f5f7a1cfc9e09b5a5f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
