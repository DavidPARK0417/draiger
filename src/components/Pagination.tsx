'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string; // 예: '/' 또는 '/blog/category/정치'
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  // 페이지 번호 배열 생성 (최대 7개 표시)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // 전체 페이지가 7개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 페이지 번호 생성
      if (currentPage <= 4) {
        // 앞부분: 1, 2, 3, 4, 5, ..., 마지막
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 뒷부분: 1, ..., 마지막-4, 마지막-3, 마지막-2, 마지막-1, 마지막
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간: 1, ..., 현재-1, 현재, 현재+1, ..., 마지막
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // URL 생성 헬퍼 함수
  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl;
    }
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 페이지네이션 숨김
  }

  return (
    <nav
      className="flex items-center justify-center gap-2 sm:gap-3 mt-12 sm:mt-16 lg:mt-20"
      aria-label="페이지네이션"
    >
      {/* 이전 버튼 */}
      {hasPrevPage ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-white/5 hover:bg-white/10
            border border-white/10 hover:border-white/20
            text-white/70 hover:text-white
            transition-all duration-300
            hover:-translate-y-0.5
            active:scale-95
          "
          aria-label="이전 페이지"
        >
          <ChevronLeft size={20} />
        </Link>
      ) : (
        <div
          className="
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-white/5
            border border-white/10
            text-white/30
            cursor-not-allowed
          "
          aria-disabled="true"
        >
          <ChevronLeft size={20} />
        </div>
      )}

      {/* 페이지 번호 버튼들 */}
      <div className="flex items-center gap-1 sm:gap-2">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="
                  w-10 h-10 sm:w-12 sm:h-12
                  flex items-center justify-center
                  text-white/30
                  text-sm sm:text-base
                "
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className={`
                flex items-center justify-center
                w-10 h-10 sm:w-12 sm:h-12
                rounded-xl
                text-sm sm:text-base font-medium
                transition-all duration-300
                ${
                  isActive
                    ? `
                      bg-emerald-500 hover:bg-emerald-600
                      dark:bg-emerald-600 dark:hover:bg-emerald-500
                      text-white
                      shadow-md hover:shadow-lg
                      hover:-translate-y-0.5
                    `
                    : `
                      bg-white/5 hover:bg-white/10
                      border border-white/10 hover:border-white/20
                      text-white/70 hover:text-white
                      hover:-translate-y-0.5
                      active:scale-95
                    `
                }
              `}
              aria-label={`${pageNum}페이지로 이동`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      {hasNextPage ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-white/5 hover:bg-white/10
            border border-white/10 hover:border-white/20
            text-white/70 hover:text-white
            transition-all duration-300
            hover:-translate-y-0.5
            active:scale-95
          "
          aria-label="다음 페이지"
        >
          <ChevronRight size={20} />
        </Link>
      ) : (
        <div
          className="
            flex items-center justify-center
            w-10 h-10 sm:w-12 sm:h-12
            rounded-xl
            bg-white/5
            border border-white/10
            text-white/30
            cursor-not-allowed
          "
          aria-disabled="true"
        >
          <ChevronRight size={20} />
        </div>
      )}
    </nav>
  );
}

