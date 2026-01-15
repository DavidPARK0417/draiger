"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const footerLinks = [
    { name: "사이트 소개", href: "/about" },
    { name: "이용약관", href: "/terms" },
    { name: "개인정보 처리방침", href: "/privacy" },
    { name: "문의하기", href: "/contact" },
  ];

  return (
    <footer className="
      bg-white dark:bg-gray-800
      border-t border-gray-200 dark:border-gray-700
      mt-auto
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 sm:pt-3 sm:pb-6 lg:py-10">
        <div className="
          flex flex-col
          lg:flex-row
          justify-between
          items-start lg:items-center
          gap-4 sm:gap-5 lg:gap-12
        ">
          {/* 왼쪽: 로고 + 설명 + 저작권 */}
          <div className="
            flex flex-col
            lg:flex-row
            gap-3 sm:gap-4 lg:gap-6
            items-start
            flex-1
            max-w-2xl
          ">
            {/* 로고 (노트북 이상에서만 표시) */}
            <Link
              href="/"
              className="
                flex-shrink-0
                transition-all duration-300
                hover:opacity-80
                active:scale-95
                hidden lg:block
              "
            >
              {/* 노트북/데스크탑 모드 (1024px 이상): DRAIGER_width.jpeg 사용 */}
              <Image
                src="/DRAIGER_width.jpeg"
                alt="DRAIGER"
                width={180}
                height={50}
                className="h-12 lg:h-16 w-auto object-contain"
                priority
              />
            </Link>

            {/* 설명 텍스트 + 저작권 (노트북 이상에서만 표시) */}
            <div className="
              space-y-2
              flex-1
              hidden lg:block
            ">
              <p className="
                text-xs sm:text-sm
                text-gray-700 dark:text-gray-300
                leading-tight
                font-normal
              ">
                매일 쌓이는 지식과 꼭 필요한 스마트 도구를 제공하는<br />
                데일리 툴킷입니다.
              </p>
              <p className="
                text-xs sm:text-sm
                text-gray-500 dark:text-gray-500
                font-light
              ">
                © 2026 Draiger : 데일리 툴킷. All rights reserved.
              </p>
            </div>
          </div>

          {/* 오른쪽: 링크들 (세로 배치) */}
          <div className="
            flex flex-col
            gap-1.5
            items-start
            lg:items-end
            flex-shrink-0
            pr-12 sm:pr-14 lg:pr-16
          ">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="
                  text-xs sm:text-sm
                  text-gray-700 dark:text-gray-300
                  hover:text-emerald-600 dark:hover:text-emerald-400
                  dark:text-gray-400
                  transition-all duration-200
                  hover:translate-x-0.5
                  active:scale-95
                  font-normal
                "
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* 저작권 정보 (모바일/태블릿에서만 푸터 하단에 표시) */}
        <div className="
          lg:hidden
          mt-4 sm:mt-5
          pt-3 sm:pt-4
          border-t border-gray-200 dark:border-gray-700
          text-center
          text-xs sm:text-sm
          text-gray-500 dark:text-gray-500
          font-light
        ">
          © 2026 Draiger : 데일리 툴킷. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

