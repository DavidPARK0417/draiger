'use client';

import { ReactNode } from 'react';

interface AIGeneratedContentProps {
  children: ReactNode;
  showWarning?: boolean;
}

/**
 * AI 생성 콘텐츠임을 표시하는 컴포넌트
 * AI 기본법 준수를 위한 필수 컴포넌트
 */
export function AIGeneratedContent({ children, showWarning = true }: AIGeneratedContentProps) {
  return (
    <div className="mb-6">
      {/* AI 생성 콘텐츠 표시 배지 */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <svg 
          className="w-4 h-4 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
        <span className="font-medium">AI 기반 분석 결과</span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-medium">
          AI 생성 콘텐츠
        </span>
      </div>
      
      {/* AI 분석 결과 본문 */}
      <div className="mb-4">
        {children}
      </div>
      
      {/* 주의사항 */}
      {showWarning && (
        <div className="mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            ⚠️ 본 분석 결과는 AI가 생성한 것으로, 참고용으로만 활용하시기 바랍니다. 
            실제 의사결정 시에는 추가 검증이 필요할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

