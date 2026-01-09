"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const marketingTools = [
  { name: "광고 성과 계산", href: "/tools/ad-performance" },
  { name: "키워드 분석", href: "/tools/keyword-analysis" },
  { name: "ROI 계산기", href: "/tools/roi-calculator" },
  { name: "손익분기점 계산기", href: "/tools/break-even-point" },
  { name: "광고 예산 계산기", href: "/tools/budget-calculator" },
  { name: "CRO 계산기", href: "/tools/conversion-calculator" },
  { name: "수익성 진단", href: "/tools/profitability-diagnosis" },
];

const usefulTools = [
  { name: "이미지크기 조정", href: "/tools/image-resize" },
  { name: "파비콘 생성기", href: "/tools/favicon-generator" },
  { name: "QR코드 생성기", href: "/tools/qr-code-generator" },
  { name: "글자수 세기", href: "/tools/character-counter" },
  { name: "세계시간 변환기", href: "/tools/world-time-converter" },
  { name: "알람시계", href: "/tools/alarm-clock" },
];

const navigation = [{ name: "문의하기", href: "/contact" }];

export default function Header() {
  const pathname = usePathname();
  const [isMarketingToolsOpen, setIsMarketingToolsOpen] = useState(false);
  const [isUsefulToolsOpen, setIsUsefulToolsOpen] = useState(false);
  const marketingToolsDropdownRef = useRef<HTMLDivElement>(null);
  const usefulToolsDropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 현재 경로가 마케팅 도구 중 하나인지 확인
  const isMarketingToolActive = marketingTools.some(
    (tool) => pathname === tool.href
  );

  // 현재 경로가 유용한 도구 중 하나인지 확인
  const isUsefulToolActive = usefulTools.some((tool) => pathname === tool.href);

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

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-24 sm:min-h-16">
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center transition-opacity duration-300 hover:opacity-80"
            >
              {/* 모바일 모드 (640px 미만): adtoolkit.jpg만 사용 */}
              <Image
                src="/adtoolkit.jpg"
                alt="adtoolkit"
                width={427}
                height={149}
                className="block sm:hidden h-20 w-auto object-contain"
                priority
              />
              {/* 태블릿/노트북/데스크탑 모드 (640px 이상): adtoolkit_logo.jpg만 사용 */}
              <Image
                src="/adtoolkit_logo.jpg"
                alt="adtoolkit"
                width={180}
                height={50}
                className="hidden sm:block h-10 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* 홈 메뉴 */}
            <Link
              href="/"
              className={`
                px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                transition-all duration-300
                ${
                  pathname === "/"
                    ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    : "text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300"
                }
              `}
            >
              홈
            </Link>

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
        </div>
      </div>
    </header>
  );
}
