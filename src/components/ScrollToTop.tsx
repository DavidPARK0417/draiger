"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // 스크롤 위치 감지
  useEffect(() => {
    const toggleVisibility = () => {
      // 스크롤이 300px 이상 내려가면 버튼 표시
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // 초기 체크
    toggleVisibility();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", toggleVisibility);

    // 클린업
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // 페이지 최상단으로 부드럽게 스크롤
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed
        bottom-4 right-4
        sm:bottom-6 sm:right-6
        lg:bottom-8 lg:right-8
        z-50
        p-3
        sm:p-3.5
        lg:p-4
        rounded-full
        bg-emerald-500 hover:bg-emerald-600
        dark:bg-emerald-600 dark:hover:bg-emerald-500
        text-white
        shadow-lg hover:shadow-xl
        dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70
        transition-all duration-300
        hover:-translate-y-1 active:scale-95
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
      aria-label="페이지 최상단으로 이동"
      title="위로 가기"
    >
      <ArrowUp 
        size={20}
        className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
      />
    </button>
  );
}

