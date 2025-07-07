// firebase-messaging-sw.js

// O importScripts para o SDK do Beams no Service Worker AINDA É ESSENCIAL
// Ele configura a infraestrutura para o Beams no Service Worker.
importScripts('https://js.pusher.com/beams/service-worker.js');

// Mantenha suas credenciais:
const BEAMS_INSTANCE_ID = '817d3c15-5b04-4da3-ae94-eaee8b489330';

// No Service Worker, você precisa adicionar um listener para o evento 'push'.
// O SDK do Beams, quando importado, já lida com o parse da payload
// e o dispacha através do evento 'push' que o Service Worker recebe.
self.addEventListener('push', function(event) {
  // Verifique se há dados na notificação
  const payload = event.data ? event.data.json() : {};

  console.log('Notificação Beams recebida no evento push:', payload);

  // Aqui você pode personalizar como a notificação será exibida.
  // Os dados da notificação geralmente vêm em payload.notification (para título/corpo)
  // e payload.data (para dados personalizados).
  const title = payload.notification && payload.notification.title || 'Nova Notificação';
  const options = {
    body: payload.notification && payload.notification.body || 'Você tem uma nova mensagem.',
    icon: payload.notification && payload.notification.icon || '/assets/icon.png', // Ajuste conforme seu projeto
    badge: '/assets/badge.png', // Opcional, ajuste conforme seu projeto
    data: payload.data || {}, // Anexa dados personalizados
    // Adicione outras opções da API de Notificação, como `vibrate`, `image`, `actions`, etc.
    // actions: [
    //   { action: 'explore', title: 'Explorar' },
    //   { action: 'close', title: 'Fechar Notificaçao' }
    // ]
  };

  // Garanta que o Service Worker permaneça ativo até que a notificação seja mostrada.
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.notification);
  event.notification.close(); // Fecha a notificação automaticamente ao clicar

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
