'use client';

import { useEffect } from 'react';

/**
 * PWA Service Worker 등록 컴포넌트
 * 
 * Draiger (드라이거) 앱의 클라이언트 사이드에서 Service Worker를 등록합니다.
 */
export default function PWAServiceWorker() {
  useEffect(() => {
    // Service Worker 지원 여부 확인
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // 프로덕션 환경에서만 Service Worker 등록
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('[PWA] Service Worker 등록 성공:', registration.scope);
            
            // 주기적으로 업데이트 확인 (1시간마다)
            setInterval(() => {
              registration.update();
            }, 3600000); // 1시간 = 3600000ms
            
            // 업데이트 확인
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // 새 버전이 설치되었음 - 즉시 활성화
                      console.log('[PWA] 새 버전이 설치되었습니다. 즉시 활성화합니다.');
                      // 메시지 채널을 사용하지 않고 직접 메시지 전송 (오류 방지)
                      try {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                      } catch (error) {
                        console.warn('[PWA] Service Worker 메시지 전송 실패 (무시):', error);
                      }
                      // 페이지 새로고침하여 새 버전 적용
                      window.location.reload();
                    } else {
                      // 첫 설치
                      console.log('[PWA] Service Worker 첫 설치 완료');
                    }
                  }
                });
              }
            });
            
            // Service Worker 메시지 리스너 (skipWaiting 요청 처리)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
              console.log('[PWA] 새 Service Worker가 활성화되었습니다.');
              // 페이지 새로고침하여 새 버전 적용
              window.location.reload();
            });

            // Service Worker 메시지 핸들링 (오류 방지)
            navigator.serviceWorker.addEventListener('message', (event) => {
              // Service Worker로부터 메시지 수신 시 처리
              if (event.data && event.data.type) {
                console.log('[PWA] Service Worker 메시지 수신:', event.data.type);
              }
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker 등록 실패:', error);
          });
      } else {
        console.log('[PWA] 개발 환경에서는 Service Worker를 등록하지 않습니다.');
      }
    }
  }, []);

  return null;
}

