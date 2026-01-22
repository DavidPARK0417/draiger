'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface AIConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onReject: () => void;
}

/**
 * AI 기능 사용 전 동의를 받는 모달 컴포넌트
 * AI 기본법 준수를 위한 선택적 컴포넌트 (권장)
 */
export function AIConsentModal({ isOpen, onAccept, onReject }: AIConsentModalProps) {
  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4"
      onClick={onReject}
    >
      <div 
        className="
          bg-white dark:bg-gray-800 
          rounded-lg 
          p-6 sm:p-8 
          max-w-md w-full 
          shadow-lg 
          border border-gray-100 dark:border-gray-700
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          AI 기반 분석 기능 사용 동의
        </h3>
        
        <div className="space-y-4 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
          <p>
            본 기능은 Google Gemini AI를 활용하여 제공됩니다.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>입력하신 정보는 AI 분석을 위해 Google 서버로 전송됩니다.</li>
            <li>AI 분석 결과는 참고용으로만 활용하시기 바랍니다.</li>
            <li>AI 분석 결과의 정확성을 보장하지 않습니다.</li>
          </ul>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            자세한 내용은{' '}
            <Link 
              href="/privacy#ai" 
              className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              개인정보 처리방침
            </Link>
            을 확인해주세요.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReject}
            className="
              flex-1 px-4 py-2.5 
              bg-gray-100 dark:bg-gray-700 
              text-gray-700 dark:text-gray-300 
              rounded-lg 
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors duration-300
              font-medium
            "
          >
            거부
          </button>
          <button
            onClick={onAccept}
            className="
              flex-1 px-4 py-2.5 
              bg-emerald-500 hover:bg-emerald-600
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white 
              rounded-lg
              shadow-sm hover:shadow-md
              transition-all duration-300
              font-medium
            "
          >
            동의하고 사용하기
          </button>
        </div>
      </div>
    </div>
  );
}

