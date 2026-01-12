'use client';

import { HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  text: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ text, children }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowPosition: 'bottom' as 'top' | 'bottom' });
  const iconRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && iconRef.current) {
      const updatePosition = () => {
        if (!iconRef.current) return;
        
        const rect = iconRef.current.getBoundingClientRect();
        const tooltipWidth = 280; // max-w-[280px]
        const tooltipHeight = 120; // 예상 높이 (여유있게)
        
        // fixed positioning은 뷰포트 기준이므로 getBoundingClientRect()의 좌표를 그대로 사용
        // scroll 값을 더하지 않음!
        let left = rect.left + rect.width / 2;
        // 항상 위쪽에 표시 (뷰포트 기준)
        let top = rect.top - tooltipHeight - 12;
        let arrowPosition: 'top' | 'bottom' = 'bottom';
        
        // 화면 밖으로 나가지 않도록 조정 (뷰포트 기준)
        if (left - tooltipWidth / 2 < 10) {
          left = tooltipWidth / 2 + 10;
        } else if (left + tooltipWidth / 2 > window.innerWidth - 10) {
          left = window.innerWidth - tooltipWidth / 2 - 10;
        }
        
        // 위쪽 공간이 부족하면 아래쪽에 표시 (뷰포트 기준, 0보다 작으면)
        if (top < 5) {
          top = rect.bottom + 12;
          arrowPosition = 'top';
        }
        
        setPosition({ top, left, arrowPosition });
      };
      
      // 즉시 위치 계산
      updatePosition();
      
      // 리사이즈 및 스크롤 이벤트 리스너
      // 스크롤 시에도 위치를 업데이트 (요소가 뷰포트에서 이동하므로)
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    // 약간의 지연을 두어 툴팁으로 마우스를 이동할 수 있게 함
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span className="relative inline-flex items-center">
        {children}
        <span
          ref={iconRef}
          className="relative inline-flex items-center ml-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={() => setIsVisible(!isVisible)}
        >
          <HelpCircle
            size={16}
            className="text-gray-400 dark:text-gray-500 hover:text-emerald-500 dark:hover:text-emerald-400 cursor-help transition-colors duration-200"
          />
        </span>
      </span>
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs sm:text-sm rounded-lg shadow-xl z-[9999] whitespace-normal max-w-[280px] sm:max-w-xs pointer-events-auto"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {text}
          {position.arrowPosition === 'bottom' ? (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          ) : (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
              <div className="border-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

