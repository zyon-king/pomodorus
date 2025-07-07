// firebase-messaging-sw.js

// Importe o SDK do Firebase (se você estiver usando Firebase Cloud Messaging em conjunto,
// mas para Beams, você precisa do SDK do Beams diretamente).
// Normalmente, você importaria o SDK do Beams aqui.
// Como estamos focando apenas no Beams Push Notifications (e não no FCM completo),
// vamos direto para a inicialização do Beams SDK dentro do service worker.

// A versão atual do SDK do Pusher Beams para Service Workers é carregada de um CDN.
// É importante carregá-lo antes de inicializar.

importScripts('https://js.pusher.com/beams/service-worker.js');

// Configuração do Pusher Beams
// Estas são as suas credenciais temporárias que você forneceu.
const BEAMS_INSTANCE_ID = '817d3c15-5b04-4da3-ae94-eaee8b489330';
const BEAMS_PRIMARY_KEY = '7DEA81966E7C8E199A5F731360F1CC1DA47776EDF5391776B13612E085A00CEF';

// Inicialize o Beams dentro do Service Worker.
// Isso configura o Service Worker para lidar com as notificações do Beams.
// A função `PusherPushNotifications.onBackgroundNotification` é o coração
// do tratamento de notificações em segundo plano.
PusherPushNotifications.onBackgroundNotification(function(payload) {
  console.log('Notificação Beams recebida em segundo plano:', payload);

  // Aqui você pode personalizar como a notificação será exibida.
  // O 'payload.notification' contém os dados da notificação (title, body, icon, etc.).
  // O 'payload.data' contém dados personalizados que você enviou.

  const title = payload.notification.title || 'Nova Notificação';
  const options = {
    body: payload.notification.body || 'Você tem uma nova mensagem.',
    icon: payload.notification.icon || '/assets/icon.png', // Um ícone padrão, ajuste conforme seu projeto
    badge: '/assets/badge.png', // Um badge opcional, ajuste conforme seu projeto
    data: payload.data, // Anexa dados personalizados à notificação
    // Adicione outras opções da API de Notificação, como `vibrate`, `image`, `actions`, etc.
    // actions: [
    //   {
    //     action: 'explore',
    //     title: 'Explorar'
    //   },
    //   {
    //     action: 'close',
    //     title: 'Fechar Notificação'
    //   }
    // ]
  };

  // Retorne uma Promise que resolve quando a notificação for exibida.
  // Isso é importante para garantir que o Service Worker permaneça ativo
  // até que a notificação seja mostrada.
  return self.registration.showNotification(title, options);
});


// Opcional: Adicionar listeners para eventos de clique em notificações
self.addEventListener('notificationclick', function(event) {
  console.log('Notificação clicada:', event.notification);
  event.notification.close(); // Fecha a notificação automaticamente ao clicar

  // Você pode adicionar lógica para abrir uma URL específica ou
  // executar uma ação com base nos dados da notificação.
  if (event.action === 'explore') {
    clients.openWindow('https://zyon-king.github.io/pomodorus/'); // Abre uma nova aba para seu projeto
  } else if (event.action === 'close') {
    // Apenas fecha, já tratado pelo event.notification.close()
  } else {
    // Comportamento padrão ao clicar no corpo da notificação
    clients.openWindow('https://zyon-king.github.io/pomodorus/');
  }
});

// Opcional: Adicionar listener para o evento de fechar a notificação
self.addEventListener('notificationclose', function(event) {
  console.log('Notificação fechada:', event.notification);
  // Você pode limpar algo ou registrar que a notificação foi ignorada
});

// Outros eventos do Service Worker (install, activate) são gerenciados implicitamente
// pelo SDK do Beams, mas você pode adicionar sua própria lógica se precisar.
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  self.skipWaiting(); // Força a ativação do novo Service Worker imediatamente
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  event.waitUntil(clients.claim()); // Assume o controle das páginas imediatamente
});
