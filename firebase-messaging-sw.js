// firebase-messaging-sw.js

// 1. Importa a biblioteca do Pusher Beams
// A versão mais recente pode ser verificada na documentação do Pusher Beams
importScripts('https://js.pusher.com/beams/1.0/beams.min.js');

// Configurações do Appwrite para buscar a Instance ID do Beams
// VOCÊ PRECISA SUBSTITUIR ESTES VALORES PELOS SEUS REAIS DO APPWRITE
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'; // Ou seu endpoint self-hosted, ex: 'http://localhost/v1'
const APPWRITE_PROJECT_ID = '686a67d5003a1b4b1bf9'; // Seu ID de Projeto do Appwrite
const APPWRITE_DATABASE_ID = '686a68130002b51fced0'; // O ID do seu banco de dados (geralmente 'default')
const APPWRITE_COLLECTION_ID = 'key'; // O ID da sua coleção de configurações (ex: 'config')
const APPWRITE_DOCUMENT_ID = '686a6945002f2fa035d1'; // O ID do documento onde está a beamsInstanceId (ex: 'beams_config' ou o ID gerado)

/**
 * Função para buscar a Instance ID do Pusher Beams do Appwrite.
 * O Service Worker precisa ser capaz de fazer requisições de rede.
 */
async function getBeamsInstanceId() {
    console.log('Service Worker: Tentando buscar beamsInstanceId do Appwrite...');
    try {
        const response = await fetch(
            `${APPWRITE_ENDPOINT}/databases/${APPWRITE_DATABASE_ID}/collections/${APPWRITE_COLLECTION_ID}/documents/${APPWRITE_DOCUMENT_ID}`,
            {
                method: 'GET',
                headers: {
                    'X-Appwrite-Project': APPWRITE_PROJECT_ID,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Service Worker: Erro ao buscar documento do Appwrite:', response.status, errorData);
            throw new Error(`Failed to fetch Appwrite document: ${response.statusText}`);
        }

        const data = await response.json();
        const beamsInstanceId = data.beamsInstanceId;

        if (!beamsInstanceId) {
            console.error('Service Worker: beamsInstanceId não encontrada no documento do Appwrite.', data);
            throw new Error('beamsInstanceId not found in Appwrite document.');
        }

        console.log('Service Worker: beamsInstanceId obtida com sucesso do Appwrite:', beamsInstanceId);
        return beamsInstanceId;

    } catch (error) {
        console.error('Service Worker: Erro ao obter beamsInstanceId do Appwrite:', error);
        // Em caso de falha, podemos retornar null ou lançar o erro para que a inicialização do Beams não ocorra
        return null;
    }
}

// 2. Inicializa o Pusher Beams
// Usamos uma IIFE (Immediately Invoked Function Expression) assíncrona
// para poder usar 'await' no nível superior do Service Worker.
(async () => {
    const beamsInstanceId = await getBeamsInstanceId();

    if (beamsInstanceId) {
        try {
            console.log('Service Worker: Inicializando Pusher Beams...');
            const beamsClient = new PusherPushNotifications.Client({
                instanceId: beamsInstanceId,
            });

            // Adiciona um listener para a ativação do Service Worker
            // Certifica que o Beams está pronto quando o SW é ativado
            self.addEventListener('activate', event => {
                event.waitUntil(
                    beamsClient.start()
                        .then(() => console.log('Service Worker: Pusher Beams iniciado com sucesso.'))
                        .catch(e => console.error('Service Worker: Erro ao iniciar Pusher Beams:', e))
                );
            });

            // Adiciona um listener para o evento 'push'
            // O Service Worker lida com a notificação recebida do Beams/FCM
            self.addEventListener('push', event => {
                console.log('Service Worker: Notificação push recebida!', event);
                const payload = event.data ? event.data.json() : {};

                const title = payload.notification?.title || 'Pomodorus';
                const options = {
                    body: payload.notification?.body || 'Você tem uma nova mensagem.',
                    icon: payload.notification?.icon || '/path/to/your/icon.png', // Substitua pelo caminho real do seu ícone
                    badge: payload.notification?.badge || '/path/to/your/badge.png', // Opcional: ícone menor para barra de status
                    data: payload.data, // Dados adicionais que você pode querer processar no click
                    // Outras opções de notificação: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
                    actions: payload.notification?.actions || []
                };

                event.waitUntil(
                    self.registration.showNotification(title, options)
                        .then(() => console.log('Service Worker: Notificação exibida com sucesso.'))
                        .catch(e => console.error('Service Worker: Erro ao exibir notificação:', e))
                );
            });

            // Adiciona um listener para o evento 'notificationclick'
            // Lida com o clique do usuário na notificação
            self.addEventListener('notificationclick', event => {
                console.log('Service Worker: Notificação clicada!', event.notification);
                event.notification.close(); // Fecha a notificação após o clique

                // Exemplo: Abre uma URL específica ao clicar na notificação
                // Você pode personalizar isso para abrir a página principal ou uma URL específica baseada em event.notification.data
                event.waitUntil(
                    clients.openWindow('/') // Abre a raiz do seu site
                );
            });

        } catch (e) {
            console.error('Service Worker: Falha ao inicializar Pusher Beams:', e);
        }
    } else {
        console.warn('Service Worker: Não foi possível inicializar Pusher Beams. beamsInstanceId não disponível.');
    }
})();

// Outros eventos do Service Worker (opcional, mas boas práticas)
self.addEventListener('install', event => {
    console.log('Service Worker: Instalado!');
    event.waitUntil(self.skipWaiting()); // Força o Service Worker a ativar imediatamente
});

self.addEventListener('fetch', event => {
    // Para um Service Worker focado em push, o 'fetch' pode não ser crucial.
    // Você pode adicionar lógica de cache aqui para assets da sua PWA, se desejar.
});
