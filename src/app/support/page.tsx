"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Coffee,
  Heart,
  Wallet,
  ExternalLink,
  X,
  Maximize2,
} from "lucide-react";

export default function SupportPage() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBmcScriptLoaded, setIsBmcScriptLoaded] = useState(false);

  // Buy Me a Coffee 위젯 스크립트 직접 삽입
  useEffect(() => {
    // 이미 스크립트가 로드되어 있는지 확인
    const existingScript = document.querySelector(
      'script[data-name="BMC-Widget"]'
    );
    if (existingScript) {
      console.log("Buy Me a Coffee 위젯 스크립트가 이미 존재합니다");
      setIsBmcScriptLoaded(true);
      return;
    }

    // 스크립트 태그 생성 및 설정
    const script = document.createElement("script");
    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute("data-id", "mycoffeepick");
    script.setAttribute("data-description", "Support me on Buy me a coffee!");
    script.setAttribute("data-message", "");
    script.setAttribute("data-color", "#5F7FFF");
    script.setAttribute("data-position", "Right");
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");
    script.async = true;

    // 스크립트 로드 완료 시 처리
    script.onload = () => {
      console.log("Buy Me a Coffee 스크립트 로드 완료");
      setIsBmcScriptLoaded(true);
    };

    // 스크립트 로드 실패 시 처리
    script.onerror = (error) => {
      console.error("Buy Me a Coffee 스크립트 로드 실패:", error);
    };

    // 스크립트를 body에 추가
    document.body.appendChild(script);

    // 위젯 초기화 확인
    const checkWidget = setInterval(() => {
      const widgetButton = document.querySelector("#bmc-wbtn");
      if (widgetButton) {
        console.log("Buy Me a Coffee 위젯 버튼 생성 완료");
        clearInterval(checkWidget);
      }
    }, 100);

    // 5초 후 타임아웃
    const timeout = setTimeout(() => {
      clearInterval(checkWidget);
      console.log("Buy Me a Coffee 위젯 확인 완료 (타임아웃)");
    }, 5000);

    // 클린업 함수
    return () => {
      clearInterval(checkWidget);
      clearTimeout(timeout);
      // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
      // document.body.removeChild(script);
    };
  }, []); // 빈 배열로 마운트 시 한 번만 실행

  const supportOptions = [
    {
      name: "Toss 송금",
      description: "토스 앱으로 빠르고 간편하게 후원하기",
      icon: Wallet,
      type: "qr", // QR코드 타입
      qrImage: "/Toss_QR.jpg", // QR코드 이미지 경로
      color:
        "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      name: "Buy Me a Coffee",
      description: "커피 한 잔의 후원으로 개발을 응원해주세요",
      icon: Coffee,
      type: "link", // 링크 타입
      href: "https://www.buymeacoffee.com/mycoffeepick", // Buy Me a Coffee 링크
      color:
        "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1
            className="
            text-2xl sm:text-3xl lg:text-4xl
            font-bold
            text-gray-900 dark:text-gray-100
            mb-4
          "
          >
            후원하기
          </h1>
          <p
            className="
            text-base sm:text-lg
            text-gray-600 dark:text-gray-400
            max-w-2xl mx-auto
            leading-relaxed
          "
          >
            이 서비스가 도움이 되셨다면, 개발을 응원해주세요.
            <br className="hidden sm:block" />
            여러분의 후원은 더 나은 서비스를 만드는 데 큰 힘이 됩니다.
          </p>
        </div>

        {/* 후원 옵션 카드 그리드 */}
        <div
          className="
          grid grid-cols-1
          sm:grid-cols-2
          gap-4 sm:gap-6 lg:gap-8
        "
        >
          {supportOptions.map((option) => {
            const IconComponent = option.icon;
            const isQrType = option.type === "qr";

            // QR코드 타입인 경우
            if (isQrType) {
              return (
                <div
                  key={option.name}
                  className="
                    group
                    block
                    bg-white dark:bg-gray-800
                    border-2 border-gray-200 dark:border-gray-700
                    rounded-2xl
                    p-6 sm:p-8
                    shadow-md hover:shadow-xl
                    dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70
                    transition-all duration-300
                    hover:-translate-y-1
                    active:scale-98
                    cursor-pointer
                  "
                  onClick={() => setIsQrModalOpen(true)}
                >
                  {/* 아이콘 */}
                  <div
                    className={`
                    w-14 h-14 sm:w-16 sm:h-16
                    ${option.bgColor}
                    ${option.borderColor}
                    border-2
                    rounded-2xl
                    flex items-center justify-center
                    mb-4 sm:mb-6
                    transition-all duration-300
                    group-hover:scale-110
                  `}
                  >
                    <IconComponent size={32} className={option.textColor} />
                  </div>

                  {/* 제목 */}
                  <h3
                    className="
                    text-lg sm:text-xl
                    font-bold
                    text-gray-900 dark:text-gray-100
                    mb-2
                  "
                  >
                    {option.name}
                  </h3>

                  {/* 설명 */}
                  <p
                    className="
                    text-sm sm:text-base
                    text-gray-600 dark:text-gray-400
                    mb-4 sm:mb-6
                    leading-relaxed
                  "
                  >
                    {option.description}
                  </p>

                  {/* QR코드 미리보기 */}
                  {option.qrImage && (
                    <div className="mb-4 sm:mb-6 flex justify-center">
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-700 rounded-xl p-1 border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                        <Image
                          src={option.qrImage}
                          alt="Toss QR코드"
                          fill
                          className="object-cover rounded-lg scale-110"
                          sizes="(max-width: 640px) 128px, 160px"
                        />
                      </div>
                    </div>
                  )}

                  {/* 버튼 */}
                  <div
                    className={`
                    inline-flex items-center gap-2
                    ${option.color}
                    text-white
                    font-semibold
                    px-4 py-2.5
                    rounded-xl
                    shadow-md hover:shadow-lg
                    transition-all duration-300
                    group-hover:-translate-y-0.5
                    w-full justify-center
                  `}
                  >
                    <span>QR코드 보기</span>
                    <Maximize2 size={16} />
                  </div>
                </div>
              );
            }

            // 링크 타입인 경우 (Buy Me a Coffee)
            return (
              <a
                key={option.name}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  group
                  block
                  bg-white dark:bg-gray-800
                  border-2 border-gray-200 dark:border-gray-700
                  rounded-2xl
                  p-6 sm:p-8
                  shadow-md hover:shadow-xl
                  dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70
                  transition-all duration-300
                  hover:-translate-y-1
                  active:scale-98
                  cursor-pointer
                  no-underline
                "
                onClick={(e) => {
                  // 위젯 버튼 찾기
                  const widgetButton = document.querySelector(
                    "#bmc-wbtn"
                  ) as HTMLElement;

                  // 위젯이 로드되어 있고 버튼이 있으면 위젯 열기
                  if (widgetButton && isBmcScriptLoaded) {
                    e.preventDefault();
                    e.stopPropagation();
                    widgetButton.click();
                    console.log("Buy Me a Coffee 위젯 열기");
                  } else {
                    // 위젯이 없으면 기본 링크 동작 허용 (a 태그의 기본 동작)
                    console.log("Buy Me a Coffee 링크로 이동");
                  }
                }}
              >
                {/* 아이콘 */}
                <div
                  className={`
                  w-14 h-14 sm:w-16 sm:h-16
                  ${option.bgColor}
                  ${option.borderColor}
                  border-2
                  rounded-2xl
                  flex items-center justify-center
                  mb-4 sm:mb-6
                  transition-all duration-300
                  group-hover:scale-110
                `}
                >
                  <IconComponent size={32} className={option.textColor} />
                </div>

                {/* 제목 */}
                <h3
                  className="
                  text-lg sm:text-xl
                  font-bold
                  text-gray-900 dark:text-gray-100
                  mb-2
                "
                >
                  {option.name}
                </h3>

                {/* 설명 */}
                <p
                  className="
                  text-sm sm:text-base
                  text-gray-600 dark:text-gray-400
                  mb-4 sm:mb-6
                  leading-relaxed
                "
                >
                  {option.description}
                </p>

                {/* 버튼 */}
                <div
                  className={`
                  inline-flex items-center gap-2
                  ${option.color}
                  text-white
                  font-semibold
                  px-4 py-2.5
                  rounded-xl
                  shadow-md hover:shadow-lg
                  transition-all duration-300
                  group-hover:-translate-y-0.5
                `}
                >
                  <span>후원하기</span>
                  <ExternalLink size={16} />
                </div>
                {/* 추가 안내 텍스트 */}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center">
                  또는 화면 오른쪽의 플로팅 버튼을 이용하세요
                </p>
              </a>
            );
          })}
        </div>

        {/* QR코드 모달 */}
        {isQrModalOpen && (
          <div
            className="
              fixed inset-0 z-50
              flex items-center justify-center
              bg-black/50 dark:bg-black/70
              backdrop-blur-sm
              p-4
            "
            onClick={() => setIsQrModalOpen(false)}
          >
            <div
              className="
                relative
                bg-white dark:bg-gray-800
                rounded-2xl
                p-6 sm:p-8
                max-w-md w-full
                shadow-2xl
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="
                  absolute top-4 right-4
                  p-2
                  rounded-xl
                  bg-gray-100 dark:bg-gray-700
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  transition-colors duration-200
                "
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>

              {/* QR코드 이미지 */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Toss 송금 QR코드
                </h3>
                <div className="relative w-full aspect-square max-w-xs mx-auto bg-white dark:bg-gray-700 rounded-xl p-2 border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
                  <Image
                    src="/Toss_QR.jpg"
                    alt="Toss 송금 QR코드"
                    fill
                    className="object-cover rounded-lg scale-110"
                    sizes="(max-width: 640px) 100vw, 400px"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  토스 앱에서 QR코드를 스캔하여 송금해주세요
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 감사 메시지 */}
        <div
          className="
          mt-12 sm:mt-16
          text-center
          p-6 sm:p-8
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-2xl
          shadow-md
        "
        >
          <Heart
            size={32}
            className="
              mx-auto mb-4
              text-emerald-500 dark:text-emerald-400
            "
          />
          <p
            className="
            text-base sm:text-lg
            text-gray-700 dark:text-gray-300
            leading-relaxed
          "
          >
            여러분의 후원에 진심으로 감사드립니다.
            <br className="hidden sm:block" />더 나은 서비스를 위해 계속
            노력하겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
