// Service Worker for Draiger (드라이거) PWA
// 오프라인 캐싱 및 기본 PWA 기능 제공

const CACHE_NAME = 'draiger-v1';
const RUNTIME_CACHE = 'draiger-runtime-v1';

// 캐싱할 정적 리소스 목록
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/Favicon-16x16.png',
  '/Favicon-32x32.png',
  '/Icon-180x180.png',
  '/Icon-192x192.png',
  '/Icon-256x256.png',
  '/Icon-384x384.png',
  '/Icon-512x512.png',
  '/site.webmanifest',
  '/globals.css',
];

// Service Worker 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 정적 리소스 캐싱 중...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] 설치 완료');
        // 즉시 활성화
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] 설치 실패:', error);
      })
  );
});

// Service Worker 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 현재 버전이 아닌 오래된 캐시 삭제
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[Service Worker] 오래된 캐시 삭제:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] 활성화 완료');
        // 모든 클라이언트에 즉시 제어권 부여
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기 (Fetch 이벤트)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 같은 출처 요청만 처리
  if (url.origin !== location.origin) {
    return;
  }

  // GET 요청만 캐싱
  if (request.method !== 'GET') {
    return;
  }

  // API 요청은 네트워크 우선 전략 사용
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // 네트워크 실패 시 오프라인 메시지 반환
          return new Response(
            JSON.stringify({ error: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
    );
    return;
  }

  // 정적 리소스 및 페이지는 캐시 우선 전략 사용
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 캐시에서 찾으면 즉시 반환
          return cachedResponse;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(request)
          .then((response) => {
            // 응답이 유효한지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // 네트워크 실패 시 오프라인 페이지 반환 (있는 경우)
            if (request.destination === 'document') {
              return caches.match('/');
            }
            return new Response('오프라인 상태입니다.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
          });
      })
  );
});

// 백그라운드 동기화 (선택적)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] 백그라운드 동기화:', event.tag);
  // 필요시 백그라운드 동기화 로직 추가
});

// 푸시 알림 (선택적)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] 푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/Icon-192x192.png',
    badge: '/Icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'draiger-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Draiger', options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 알림 클릭:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

