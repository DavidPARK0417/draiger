'use client';

import Link from "next/link";
import { Home, Search, ArrowLeft, Lightbulb, UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 아이콘 및 텍스트 */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-8xl sm:text-9xl font-bold text-emerald-500 dark:text-emerald-400 mb-4 animate-pulse">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
            <br />
            아래 링크를 통해 다른 페이지로 이동해보세요.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {/* 홈으로 가기 */}
          <Link
            href="/"
            className="
              group
              flex items-center justify-center gap-3
              bg-emerald-500 hover:bg-emerald-600
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white font-medium
              px-6 py-4 rounded-lg
              shadow-sm hover:shadow-md
              transition-all duration-300
              hover:-translate-y-0.5
            "
          >
            <Home size={20} />
            <span>홈으로 가기</span>
          </Link>

          {/* 뒤로 가기 */}
          <button
            onClick={() => window.history.back()}
            className="
              group
              flex items-center justify-center gap-3
              bg-gray-100 hover:bg-gray-200
              dark:bg-gray-700 dark:hover:bg-gray-600
              text-gray-700 dark:text-gray-200 font-medium
              px-6 py-4 rounded-lg
              border border-gray-200 dark:border-gray-600
              transition-colors duration-300
            "
          >
            <ArrowLeft size={20} />
            <span>뒤로 가기</span>
          </button>
        </div>

        {/* 추천 페이지 링크 */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            추천 페이지
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 인사이트 페이지 */}
            <Link
              href="/insight"
              className="
                group
                flex items-center gap-3
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                text-gray-900 dark:text-white
                px-4 py-3 rounded-lg
                shadow-sm hover:shadow-md
                transition-all duration-300
                hover:-translate-y-1
              "
            >
              <Lightbulb className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <div className="text-left">
                <div className="font-medium">인사이트</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  유용한 지식과 정보
                </div>
              </div>
            </Link>

            {/* 오늘의 메뉴 페이지 */}
            <Link
              href="/menu"
              className="
                group
                flex items-center gap-3
                bg-white dark:bg-gray-800
                border border-gray-100 dark:border-gray-700
                text-gray-900 dark:text-white
                px-4 py-3 rounded-lg
                shadow-sm hover:shadow-md
                transition-all duration-300
                hover:-translate-y-1
              "
            >
              <UtensilsCrossed className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <div className="text-left">
                <div className="font-medium">오늘의 메뉴</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  맛있는 레시피 모음
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 검색 안내 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            <Search size={16} />
            <span>찾으시는 페이지가 있으신가요? 검색을 이용해보세요.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

