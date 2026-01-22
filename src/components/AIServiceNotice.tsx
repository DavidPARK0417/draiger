'use client';

import Link from 'next/link';

/**
 * AI 서비스 제공 사실을 고지하는 컴포넌트
 * AI 기본법 준수를 위한 필수 컴포넌트
 */
export function AIServiceNotice() {
  return (
    <div className="
      mb-6 p-4 sm:p-5
      bg-blue-50 dark:bg-blue-900/20
      border border-blue-200 dark:border-blue-800
      rounded-lg
      shadow-sm dark:shadow-gray-900/30
    ">
      <div className="flex items-start gap-3">
        <svg 
          className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-medium text-blue-900 dark:text-blue-100 mb-1.5">
            AI 기반 서비스 안내
          </p>
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
            본 기능은 Google Gemini AI를 활용하여 제공됩니다. 
            입력하신 정보는 AI 분석을 위해 Google 서버로 전송될 수 있습니다.
            {' '}
            <Link 
              href="/privacy#ai" 
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              자세히 보기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

