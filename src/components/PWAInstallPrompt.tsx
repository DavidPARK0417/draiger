'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * PWA 설치 안내 팝업 컴포넌트
 * 
 * Draiger (드라이거) 앱의 모바일 사용자에게 앱 설치를 유도하는 팝업입니다.
 * - 24시간 동안 닫힌 상태 유지 (localStorage 사용)
 * - 모바일 환경에서만 표시
 * - 설치 가능한 경우에만 표시
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // localStorage 키
  const STORAGE_KEY = 'draiger-pwa-install-dismissed';
  const STORAGE_TIMESTAMP_KEY = 'draiger-pwa-install-dismissed-timestamp';
  
  // 24시간을 밀리초로 변환
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    // 이미 설치되어 있는지 확인
    const checkInstalled = () => {
      // standalone 모드로 실행 중이면 이미 설치됨
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      
      // iOS Safari의 경우
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      
      return false;
    };

    // 모바일 환경 확인
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };

    // 이미 설치되어 있으면 표시하지 않음
    if (checkInstalled()) {
      return;
    }

    // 모바일이 아니면 표시하지 않음
    if (!isMobile()) {
      return;
    }

    // localStorage에서 닫힌 시간 확인
    const dismissedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (dismissedTimestamp) {
      const now = Date.now();
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      const timeDiff = now - dismissedTime;

      // 24시간이 지나지 않았으면 표시하지 않음
      if (timeDiff < TWENTY_FOUR_HOURS) {
        return;
      }
    }

    // beforeinstallprompt 이벤트 리스너 (Chrome, Edge 등)
    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 설치 프롬프트 방지
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // iOS Safari의 경우 항상 표시 (beforeinstallprompt 이벤트가 없음)
    if (isMobile() && !dismissedTimestamp) {
      // iOS인지 확인
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        setShowPrompt(true);
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // 설치 버튼 클릭 핸들러
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome, Edge 등에서 설치 프롬프트 표시
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] 사용자 선택:', outcome);
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      
      // 설치 완료 시 localStorage에 저장
      if (outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, 'true');
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      }
    } else {
      // iOS Safari의 경우 수동 안내
      // 실제로는 사용자가 수동으로 설치해야 하므로 안내만 표시
      console.log('[PWA] iOS Safari - 수동 설치 안내');
    }
  };

  // 닫기 버튼 클릭 핸들러
  const handleDismiss = () => {
    setShowPrompt(false);
    // localStorage에 닫힌 시간 저장
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  };

  // 이미 설치되어 있거나 표시하지 않아야 하면 null 반환
  if (!showPrompt || isInstalled) {
    return null;
  }

  // iOS Safari인지 확인
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        p-4 sm:p-6
        bg-white dark:bg-gray-800
        border-t border-gray-200 dark:border-gray-700
        shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]
        animate-slide-up
      "
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4">
          {/* 아이콘 */}
          <div
            className="
              flex-shrink-0
              w-12 h-12 sm:w-14 sm:h-14
              bg-emerald-100 dark:bg-emerald-900/30
              rounded-xl
              flex items-center justify-center
            "
          >
            <Smartphone
              className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>

          {/* 내용 */}
          <div className="flex-1 min-w-0">
            <h3
              id="pwa-install-title"
              className="
                text-base sm:text-lg
                font-bold
                text-gray-900 dark:text-gray-100
                mb-1
              "
            >
              Draiger를 앱으로 설치하고 매일 새로운 트렌드 알림을 받아보세요!
            </h3>
            <p
              id="pwa-install-description"
              className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                mb-4
              ">
              {isIOS
                ? 'Safari에서 공유 버튼(⬆️)을 누르고 "홈 화면에 추가"를 선택하세요.'
                : '홈 화면에 추가하여 빠르게 접근하고 오프라인에서도 사용하세요.'}
            </p>

            {/* 버튼 그룹 */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleInstallClick}
                className="flex-1 sm:flex-initial"
                size="md"
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                설치하기
              </Button>
              <Button
                onClick={handleDismiss}
                variant="secondary"
                className="flex-1 sm:flex-initial"
                size="md"
              >
                나중에
              </Button>
            </div>
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={handleDismiss}
            className="
              flex-shrink-0
              p-2
              rounded-lg
              text-gray-400 dark:text-gray-500
              hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
            "
            aria-label="팝업 닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

    </div>
  );
}

