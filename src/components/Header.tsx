"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";

// Google Analytics gtag 타입 정의
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, string | number | boolean>
    ) => void;
    dataLayer?: unknown[];
  }
}

const marketingTools = [
  { name: "광고 성과 계산", href: "/tools/ad-performance" },
  { name: "ROI 계산기", href: "/tools/roi-calculator" },
  { name: "키워드 분석", href: "/tools/keyword-analysis" },
  { name: "손익분기점 계산기", href: "/tools/break-even-point" },
  { name: "광고 예산 계산기", href: "/tools/budget-calculator" },
  { name: "CRO 계산기", href: "/tools/conversion-calculator" },
  { name: "수익성 진단", href: "/tools/profitability-diagnosis" },
];

const usefulTools = [
  { name: "이미지크기 조정", href: "/tools/image-resize" },
  { name: "파비콘 생성기", href: "/tools/favicon-generator" },
  { name: "QR코드 생성기", href: "/tools/qr-code-generator" },
  { name: "URL 단축", href: "/tools/url-shortener" },
  { name: "글자수 세기", href: "/tools/character-counter" },
  { name: "세계시간 변환기", href: "/tools/world-time-converter" },
  { name: "알람시계", href: "/tools/alarm-clock" },
  { name: "파일 미리보기", href: "/tools/file-preview" },
  { name: "이자 계산기", href: "/tools/interest-calculator" },
];

const blogCategories = [
  { name: "내일의 AI", href: "/insight/category/" + encodeURIComponent("내일의 AI") },
  { name: "돈이 되는 소식", href: "/insight/category/" + encodeURIComponent("돈이 되는 소식") },
  { name: "궁금한 세상 이야기", href: "/insight/category/" + encodeURIComponent("궁금한 세상 이야기") },
  { name: "슬기로운 생활", href: "/insight/category/" + encodeURIComponent("슬기로운 생활") },
  { name: "오늘보다 건강하게", href: "/insight/category/" + encodeURIComponent("오늘보다 건강하게") },
  { name: "마음 채우기", href: "/insight/category/" + encodeURIComponent("마음 채우기") },
  { name: "기타", href: "/insight/category/" + encodeURIComponent("기타") },
];

const navigation = [{ name: "문의하기", href: "/contact" }];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [isMarketingToolsOpen, setIsMarketingToolsOpen] = useState(false);
  const [isUsefulToolsOpen, setIsUsefulToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerHeight, setHeaderHeight] = useState(48); // 기본값: min-h-12 (48px)
  const [mounted, setMounted] = useState(false); // Hydration 오류 방지
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState<number>(0);
  const blogDropdownRef = useRef<HTMLDivElement>(null);
  const marketingToolsDropdownRef = useRef<HTMLDivElement>(null);
  const usefulToolsDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLDivElement>(null);
  const mobileMenuPanelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Hydration 오류 방지: 클라이언트에서만 마운트
  useEffect(() => {
    setMounted(true);
  }, []);

  // 카테고리별 게시글 개수 가져오기
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        console.log("카테고리별 게시글 개수 조회 시작");
        const response = await fetch("/api/category-counts");
        if (response.ok) {
          const data = await response.json();
          console.log("카테고리별 게시글 개수 조회 성공:", data);
          setCategoryCounts(data.categories || {});
          setTotalCount(data.total || 0);
        } else {
          console.error("카테고리별 게시글 개수 조회 실패:", response.status);
        }
      } catch (error) {
        console.error("카테고리별 게시글 개수 조회 오류:", error);
      }
    };

    if (mounted) {
      fetchCategoryCounts();
    }
  }, [mounted]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 모바일 메뉴가 열려있을 때는 데스크탑 드롭다운 외부 클릭 감지 비활성화
      // (모바일 메뉴 패널 내부 클릭이 데스크탑 드롭다운 외부 클릭으로 감지되는 것을 방지)
      if (!isMobileMenuOpen) {
        // 데스크탑 드롭다운 외부 클릭 감지
        if (
          blogDropdownRef.current &&
          !blogDropdownRef.current.contains(event.target as Node)
        ) {
          setIsBlogOpen(false);
        }
        if (
          marketingToolsDropdownRef.current &&
          !marketingToolsDropdownRef.current.contains(event.target as Node)
        ) {
          setIsMarketingToolsOpen(false);
        }
        if (
          usefulToolsDropdownRef.current &&
          !usefulToolsDropdownRef.current.contains(event.target as Node)
        ) {
          setIsUsefulToolsOpen(false);
        }
      }

      // 모바일 메뉴 외부 클릭 감지 (버튼과 패널 모두 확인)
      if (isMobileMenuOpen) {
        const clickedOutsideButton =
          mobileMenuButtonRef.current &&
          !mobileMenuButtonRef.current.contains(event.target as Node);
        const clickedOutsidePanel =
          mobileMenuPanelRef.current &&
          !mobileMenuPanelRef.current.contains(event.target as Node);

        // 버튼과 패널 모두 외부를 클릭한 경우에만 메뉴 닫기
        if (clickedOutsideButton && clickedOutsidePanel) {
          setIsMobileMenuOpen(false);
          // 모바일 메뉴가 닫힐 때 드롭다운 상태도 초기화
          setIsBlogOpen(false);
          setIsMarketingToolsOpen(false);
          setIsUsefulToolsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // 모바일 메뉴가 열릴 때 body 스크롤 방지 및 상태 관리
  useEffect(() => {
    console.log("모바일 메뉴 상태 변경:", isMobileMenuOpen);
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // 모바일 메뉴가 닫힐 때 드롭다운 상태 초기화
      setIsBlogOpen(false);
      setIsMarketingToolsOpen(false);
      setIsUsefulToolsOpen(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // 헤더 높이 계산
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // 현재 경로가 블로그 관련인지 확인 (Hydration 오류 방지: mounted 후에만 확인)
  const isBlogActive = mounted && (
    pathname === "/insight" ||
    pathname.startsWith("/insight") ||
    blogCategories.some((cat) => pathname === cat.href)
  );

  // 현재 경로가 마케팅 도구 중 하나인지 확인
  const isMarketingToolActive = mounted && marketingTools.some(
    (tool) => pathname === tool.href
  );

  // 현재 경로가 유용한 도구 중 하나인지 확인
  const isUsefulToolActive = mounted && usefulTools.some((tool) => pathname === tool.href);

  // 디버깅: 드롭다운 상태 변경 로그
  useEffect(() => {
    console.log("마케팅도구 드롭다운 상태 변경:", isMarketingToolsOpen);
    if (isMarketingToolsOpen && marketingToolsDropdownRef.current) {
      const dropdownElement = marketingToolsDropdownRef.current.querySelector(
        "[data-dropdown-menu]"
      ) as HTMLElement;
      if (dropdownElement) {
        console.log("마케팅도구 드롭다운 요소 렌더링됨:", dropdownElement);
        console.log(
          "마케팅도구 드롭다운 위치:",
          dropdownElement.getBoundingClientRect()
        );
        console.log(
          "마케팅도구 드롭다운 스타일:",
          window.getComputedStyle(dropdownElement)
        );
      }
    }
  }, [isMarketingToolsOpen]);

  useEffect(() => {
    console.log("유용한도구 드롭다운 상태 변경:", isUsefulToolsOpen);
    if (isUsefulToolsOpen && usefulToolsDropdownRef.current) {
      const dropdownElement = usefulToolsDropdownRef.current.querySelector(
        "[data-dropdown-menu]"
      ) as HTMLElement;
      if (dropdownElement) {
        console.log("유용한도구 드롭다운 요소 렌더링됨:", dropdownElement);
        console.log(
          "유용한도구 드롭다운 위치:",
          dropdownElement.getBoundingClientRect()
        );
        console.log(
          "유용한도구 드롭다운 스타일:",
          window.getComputedStyle(dropdownElement)
        );
      }
    }
  }, [isUsefulToolsOpen]);

  // 모바일 메뉴 패널 렌더링 확인
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuPanelRef.current) {
      console.log("모바일 메뉴 패널 렌더링됨:", mobileMenuPanelRef.current);
      console.log(
        "모바일 메뉴 패널 위치:",
        mobileMenuPanelRef.current.getBoundingClientRect()
      );
      console.log("헤더 높이:", headerHeight);
    }
  }, [isMobileMenuOpen, headerHeight]);

  // 검색창 열릴 때 포커스 및 다른 드롭다운 닫기
  useEffect(() => {
    if (isSearchOpen) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      // 다른 드롭다운 닫기
      setIsBlogOpen(false);
      setIsMarketingToolsOpen(false);
      setIsUsefulToolsOpen(false);
    }
  }, [isSearchOpen]);

  // ESC 키로 검색창 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSearchOpen]);

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header
      ref={headerRef}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl xl:max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between min-h-12 sm:min-h-16">
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center transition-opacity duration-300 hover:opacity-80"
            >
              {/* 모바일 모드 (640px 미만): DRAIGER.jpeg 사용 */}
              <Image
                src="/DRAIGER.jpeg"
                alt="DRAIGER"
                width={427}
                height={149}
                className="block sm:hidden h-8 w-auto object-contain"
                priority
              />
              {/* 태블릿/노트북/데스크탑 모드 (640px 이상): DRAIGER_width.jpeg 사용 */}
              <Image
                src="/DRAIGER_width.jpeg"
                alt="DRAIGER"
                width={180}
                height={50}
                className="hidden sm:block h-10 lg:h-[60px] w-auto object-contain"
                priority
              />
            </Link>
          </div>
          {/* 데스크탑 네비게이션 (640px 이상) */}
          <nav className="hidden sm:flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* 검색 아이콘/검색창 */}
            {!isSearchOpen ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsSearchOpen(true);
                }}
                className="
                  p-2 rounded-xl text-sm font-medium
                  transition-all duration-300
                  text-gray-700 dark:text-white dark:font-semibold
                  hover:bg-emerald-50 dark:hover:bg-gray-700
                  hover:text-emerald-600 dark:hover:text-emerald-300
                "
                aria-label="검색"
              >
                <Search size={20} />
              </button>
            ) : (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-3 py-2 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Search size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요..."
                  className="
                    w-48 sm:w-64 lg:w-80
                    bg-transparent
                    text-gray-900 dark:text-gray-100
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none
                    text-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="
                    p-1 rounded-lg
                    text-gray-400 hover:text-gray-600
                    dark:text-gray-500 dark:hover:text-gray-300
                    transition-colors duration-150
                    flex-shrink-0
                  "
                  aria-label="닫기"
                >
                  <X size={16} />
                </button>
              </form>
            )}

            {/* 블로그 드롭다운 메뉴 */}
            <div className="relative" ref={blogDropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsBlogOpen(!isBlogOpen);
                  
                  // Google Analytics 이벤트 전송
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'view_insights', {
                      event_category: 'navigation',
                      event_label: '인사이트 버튼 클릭',
                    });
                    console.log('view_insights 이벤트 전송 완료');
                  }
                }}
                className={`
                  px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                  transition-all duration-300
                  flex items-center gap-1
                  ${
                    isBlogActive
                      ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      : "text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300"
                  }
                `}
              >
                인사이트
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isBlogOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isBlogOpen && (
                <div
                  data-dropdown-menu
                  className="
                    absolute top-full left-0 mt-2
                    w-56 sm:w-64
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-2xl shadow-xl dark:shadow-gray-900/50
                    py-2
                    z-[9999]
                    transition-all duration-200 ease-out
                    whitespace-nowrap
                  "
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "0.5rem",
                    zIndex: 9999,
                    display: "block",
                    visibility: "visible",
                    opacity: 1,
                  }}
                >
                  <Link
                    href="/insight"
                    onClick={() => setIsBlogOpen(false)}
                    className={`
                      block px-4 py-2.5 text-sm
                      transition-all duration-200
                      ${
                        pathname === "/insight" || (pathname.startsWith("/insight") && !pathname.startsWith("/insight/category"))
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                      }
                    `}
                  >
                    전체{totalCount > 0 && ` (${totalCount})`}
                  </Link>
                  {blogCategories.map((category) => {
                    const isActive = pathname === category.href;
                    const count = categoryCounts[category.name] || 0;
                    return (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={() => setIsBlogOpen(false)}
                        className={`
                          block px-4 py-2.5 text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }
                        `}
                      >
                        {category.name}{count > 0 && ` (${count})`}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 마케팅도구 드롭다운 메뉴 */}
            <div className="relative" ref={marketingToolsDropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "마케팅도구 버튼 클릭, 현재 상태:",
                    isMarketingToolsOpen
                  );
                  setIsMarketingToolsOpen(!isMarketingToolsOpen);
                }}
                className={`
                  px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                  transition-all duration-300
                  flex items-center gap-1
                  ${
                    isMarketingToolActive
                      ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      : "text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300"
                  }
                `}
              >
                마케팅도구
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isMarketingToolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isMarketingToolsOpen && (
                <div
                  data-dropdown-menu
                  className="
                    absolute top-full left-0 mt-2
                    w-56 sm:w-64
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-2xl shadow-xl dark:shadow-gray-900/50
                    py-2
                    z-[9999]
                    transition-all duration-200 ease-out
                    whitespace-nowrap
                  "
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "0.5rem",
                    zIndex: 9999,
                    display: "block",
                    visibility: "visible",
                    opacity: 1,
                  }}
                >
                  {marketingTools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={() => setIsMarketingToolsOpen(false)}
                        className={`
                          block px-4 py-2.5 text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }
                        `}
                      >
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 유용한도구 드롭다운 메뉴 */}
            <div className="relative" ref={usefulToolsDropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log(
                    "유용한도구 버튼 클릭, 현재 상태:",
                    isUsefulToolsOpen
                  );
                  setIsUsefulToolsOpen(!isUsefulToolsOpen);
                }}
                className={`
                  px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                  transition-all duration-300
                  flex items-center gap-1
                  ${
                    isUsefulToolActive
                      ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      : "text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300"
                  }
                `}
              >
                유용한도구
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isUsefulToolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {isUsefulToolsOpen && (
                <div
                  data-dropdown-menu
                  className="
                    absolute top-full left-0 mt-2
                    w-56 sm:w-64
                    bg-white dark:bg-gray-800
                    border border-gray-200 dark:border-gray-700
                    rounded-2xl shadow-xl dark:shadow-gray-900/50
                    py-2
                    z-[9999]
                    transition-all duration-200 ease-out
                    whitespace-nowrap
                  "
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    marginTop: "0.5rem",
                    zIndex: 9999,
                    display: "block",
                    visibility: "visible",
                    opacity: 1,
                  }}
                >
                  {usefulTools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={() => setIsUsefulToolsOpen(false)}
                        className={`
                          block px-4 py-2.5 text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400"
                          }
                        `}
                      >
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 일반 네비게이션 메뉴 */}
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                        : "text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300"
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 (640px 미만) */}
          <div className="sm:hidden flex items-center gap-2 flex-shrink-0">
            {/* 모바일 검색 아이콘/검색창 */}
            {!isSearchOpen ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(true);
                }}
                className="
                  p-2 rounded-xl
                  text-gray-700 dark:text-white
                  hover:bg-emerald-50 dark:hover:bg-gray-700
                  transition-all duration-300
                "
                aria-label="검색"
              >
                <Search size={20} />
              </button>
            ) : (
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 px-2 py-1.5 shadow-md flex-1 max-w-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <Search size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색..."
                  className="
                    flex-1 min-w-0
                    bg-transparent
                    text-gray-900 dark:text-gray-100
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none
                    text-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="
                    p-1 rounded-lg
                    text-gray-400 hover:text-gray-600
                    dark:text-gray-500 dark:hover:text-gray-300
                    transition-colors duration-150
                    flex-shrink-0
                  "
                  aria-label="닫기"
                >
                  <X size={14} />
                </button>
              </form>
            )}

            {/* 모바일 햄버거 메뉴 버튼 */}
            <div ref={mobileMenuButtonRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("햄버거 메뉴 클릭, 현재 상태:", isMobileMenuOpen);
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="
                  p-2 rounded-xl
                  text-gray-700 dark:text-white
                  hover:bg-emerald-50 dark:hover:bg-gray-700
                  transition-all duration-300
                "
                aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
              >
                {isMobileMenuOpen ? (
                  <X
                    size={24}
                    className="text-emerald-500 dark:text-emerald-400"
                  />
                ) : (
                  <Menu size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 패널 (640px 미만) */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuPanelRef}
          onClick={(e) => {
            // 메뉴 패널 내부 클릭 시 이벤트 전파 방지
            e.stopPropagation();
          }}
          className="sm:hidden fixed bg-white dark:bg-gray-900 z-40 overflow-y-auto"
          style={{
            top: `${headerHeight}px`,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div className="px-4 py-6 space-y-4">
            {/* 블로그 섹션 */}
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBlogOpen(!isBlogOpen);
                  
                  // Google Analytics 이벤트 전송
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'view_insights', {
                      event_category: 'navigation',
                      event_label: '인사이트 버튼 클릭 (모바일)',
                    });
                    console.log('view_insights 이벤트 전송 완료 (모바일)');
                  }
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium
                  transition-all duration-300
                  ${
                    isBlogActive
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-800"
                  }
                `}
              >
                <span>인사이트</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isBlogOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isBlogOpen && (
                <div className="pl-4 space-y-1">
                  <Link
                    href="/insight"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBlogOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                      block px-4 py-2.5 rounded-lg text-sm
                      transition-all duration-200
                      ${
                        pathname === "/insight" || (pathname.startsWith("/insight") && !pathname.startsWith("/insight/category"))
                          ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    전체{totalCount > 0 && ` (${totalCount})`}
                  </Link>
                  {blogCategories.map((category) => {
                    const isActive = pathname === category.href;
                    const count = categoryCounts[category.name] || 0;
                    return (
                      <Link
                        key={category.name}
                        href={category.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsBlogOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          block px-4 py-2.5 rounded-lg text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        {category.name}{count > 0 && ` (${count})`}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 마케팅도구 섹션 */}
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    "모바일 마케팅도구 버튼 클릭, 현재 상태:",
                    isMarketingToolsOpen
                  );
                  setIsMarketingToolsOpen(!isMarketingToolsOpen);
                  console.log(
                    "모바일 마케팅도구 버튼 클릭 후 상태:",
                    !isMarketingToolsOpen
                  );
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium
                  transition-all duration-300
                  ${
                    isMarketingToolActive
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-800"
                  }
                `}
              >
                <span>마케팅도구</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isMarketingToolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMarketingToolsOpen && (
                <div className="pl-4 space-y-1">
                  {marketingTools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMarketingToolsOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          block px-4 py-2.5 rounded-lg text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 유용한도구 섹션 */}
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(
                    "모바일 유용한도구 버튼 클릭, 현재 상태:",
                    isUsefulToolsOpen
                  );
                  setIsUsefulToolsOpen(!isUsefulToolsOpen);
                  console.log(
                    "모바일 유용한도구 버튼 클릭 후 상태:",
                    !isUsefulToolsOpen
                  );
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium
                  transition-all duration-300
                  ${
                    isUsefulToolActive
                      ? "bg-emerald-500 text-white shadow-md"
                      : "text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-800"
                  }
                `}
              >
                <span>유용한도구</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isUsefulToolsOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isUsefulToolsOpen && (
                <div className="pl-4 space-y-1">
                  {usefulTools.map((tool) => {
                    const isActive = pathname === tool.href;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUsefulToolsOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`
                          block px-4 py-2.5 rounded-lg text-sm
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        {tool.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 일반 네비게이션 메뉴 */}
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    block px-4 py-3 rounded-xl text-base font-medium
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-md"
                        : "text-gray-700 dark:text-white hover:bg-emerald-50 dark:hover:bg-gray-800"
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 모바일 메뉴 오버레이 배경 */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
