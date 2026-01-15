"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface AdFitProps {
  unitId: string;
  width?: number;
  height?: number;
  className?: string;
  onFail?: (element: HTMLElement) => void;
}

// Window 객체에 kakao 속성 추가를 위한 타입 확장
interface WindowWithKakao extends Window {
  kakao?: {
    ads: {
      display: () => void;
    };
  };
  [key: string]: unknown;
}

/**
 * 카카오 애드핏 광고 컴포넌트
 * 
 * AdFit Web SDK 가이드에 따라 구현된 광고 컴포넌트입니다.
 * 광고 요청 실패 시 NO-AD 콜백 함수를 지원합니다.
 * 
 * @param unitId - 카카오 애드핏 광고 단위 ID (필수)
 * @param width - 광고 너비 (기본값: 320)
 * @param height - 광고 높이 (기본값: 100)
 * @param className - 추가 CSS 클래스
 * @param onFail - NO-AD 콜백 함수 (광고 요청 실패 시 실행)
 * 
 * @example
 * ```tsx
 * <AdFit
 *   unitId="DAN-gzhM4ZoHUUTxO6Kg"
 *   width={250}
 *   height={250}
 *   className="my-8"
 *   onFail={(element) => {
 *     console.log("광고 로드 실패", element);
 *   }}
 * />
 * ```
 */
export default function AdFit({
  unitId,
  width = 320,
  height = 100,
  className = "",
  onFail,
}: AdFitProps) {
  const adElementRef = useRef<HTMLModElement>(null);
  const callbackNameRef = useRef<string | null>(null);

  useEffect(() => {
    // NO-AD 콜백 함수가 있는 경우 전역 함수로 등록
    if (onFail && adElementRef.current) {
      // 고유한 콜백 함수명 생성 (여러 광고 단위 사용 시 충돌 방지)
      const callbackName = `adfitCallback_${unitId.replace(/[^a-zA-Z0-9]/g, "_")}`;
      callbackNameRef.current = callbackName;

      // 전역 함수로 등록
      const windowWithKakao = window as unknown as WindowWithKakao;
      windowWithKakao[callbackName] = (element: HTMLElement) => {
        console.log("[AdFit] 광고 로드 실패 - NO-AD 콜백 실행", {
          unitId,
          element,
        });
        onFail(element);
      };
    }

    return () => {
      // 컴포넌트 언마운트 시 전역 함수 정리
      const windowWithKakao = window as unknown as WindowWithKakao;
      if (callbackNameRef.current && windowWithKakao[callbackNameRef.current]) {
        delete windowWithKakao[callbackNameRef.current];
      }
    };
  }, [onFail, unitId]);

  useEffect(() => {
    // 광고 스크립트가 로드된 후 실행
    const windowWithKakao = window as unknown as WindowWithKakao;
    if (typeof window !== "undefined" && windowWithKakao.kakao) {
      try {
        windowWithKakao.kakao.ads.display();
        console.log("[AdFit] 광고 표시 시도", { unitId, width, height });
      } catch (error) {
        console.error("[AdFit] 광고 표시 오류:", error);
      }
    }
  }, [unitId, width, height]);

  const callbackName = onFail
    ? `adfitCallback_${unitId.replace(/[^a-zA-Z0-9]/g, "_")}`
    : undefined;

  return (
    <div className={`adfit-container ${className}`}>
      <ins
        ref={adElementRef}
        className="kakao_ad_area"
        style={{ display: "none", width: "100%" }}
        data-ad-unit={unitId}
        data-ad-width={width}
        data-ad-height={height}
        {...(callbackName && { "data-ad-onfail": callbackName })}
      />
      <Script
        type="text/javascript"
        src="https://t1.daumcdn.net/kas/static/ba.min.js"
        async
        charSet="utf-8"
        strategy="lazyOnload"
        onLoad={() => {
          // 스크립트 로드 완료 후 광고 표시
          const windowWithKakao = window as unknown as WindowWithKakao;
          if (typeof window !== "undefined" && windowWithKakao.kakao) {
            try {
              windowWithKakao.kakao.ads.display();
              console.log("[AdFit] 스크립트 로드 완료 - 광고 표시", {
                unitId,
                width,
                height,
              });
            } catch (error) {
              console.error("[AdFit] 광고 표시 오류:", error);
            }
          }
        }}
        onError={(error) => {
          console.error("[AdFit] 스크립트 로드 실패:", error);
        }}
      />
    </div>
  );
}

