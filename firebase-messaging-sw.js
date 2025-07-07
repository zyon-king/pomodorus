// firebase-messaging-sw.js

importScripts('https://js.pusher.com/beams/service-worker.js');

// Mantenha suas credenciais:
const BEAMS_INSTANCE_ID = '817d3c15-5b04-4da3-ae94-eaee8b489330';
// const BEAMS_PRIMARY_KEY = '...'; // Primary key não é usada no SW, apenas o Instance ID

// É crucial que esta linha venha DEPOIS do importScripts e que o objeto PusherPushNotifications
// esteja disponível.
PusherPushNotifications.onBackgroundNotification(function(payload) {
  console.log('Notificação Beams recebida em segundo plano:', payload);

  const title = payload.notification.title || 'Nova Notificação';
  const options = {
    body: payload.notification.body || 'Você tem uma nova mensagem.',
    icon: payload.notification.icon || '/assets/icon.png',
    badge: '/assets/badge.png',
    data: payload.data,
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.notification);
  event.notification.close();
  if (event.action === 'explore') {
    clients.openWindow('https://zyon-king.github.io/pomodorus/');
  } else {
    clients.openWindow('https://zyon-king.github.io/pomodorus/');
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notificação fechada:', event.notification);
});

self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  event.waitUntil(clients.claim());
});
