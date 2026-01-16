"use client";

import { useEffect, useRef } from "react";

interface AdFitProps {
  unitId: string;
  width?: number;
  height?: number;
  className?: string;
  onFail?: (element: HTMLElement) => void;
}

// Window 객체에 kakao 속성 추가를 위한 타입 확장
interface WindowWithKakao extends Window {
  [key: string]: unknown;
}

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * AdFit Web SDK 가이드에 따라 구현된 광고 컴포넌트입니다.
 * 광고 요청 실패 시 NO-AD 콜백 함수를 지원합니다.
 *
 * 핵심 동작 원리:
 * 1. layout.tsx에서 Kakao AdFit 스크립트를 전역으로 한 번만 로드
 * 2. 이 컴포넌트는 <ins> 태그에 광고 정보를 data 속성으로 설정
 * 3. Kakao AdFit 스크립트가 자동으로 모든 <ins> 태그를 인식하여 광고를 표시
 * 4. 개발자가 직접 display() 함수를 호출할 필요 없음
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
  const callbackNameRef = useRef<string | null>(null);

  // NO-AD 콜백 함수 등록
  useEffect(() => {
    if (onFail) {
      const callbackName = `adfitCallback_${unitId.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}`;
      callbackNameRef.current = callbackName;

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
      const windowWithKakao = window as unknown as WindowWithKakao;
      if (callbackNameRef.current && windowWithKakao[callbackNameRef.current]) {
        delete windowWithKakao[callbackNameRef.current];
      }
    };
  }, [onFail, unitId]);

  const callbackName = onFail
    ? `adfitCallback_${unitId.replace(/[^a-zA-Z0-9]/g, "_")}`
    : undefined;

  return (
    <div className={`adfit-container ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unitId}
        data-ad-width={width}
        data-ad-height={height}
        {...(callbackName && { "data-ad-onfail": callbackName })}
      />
    </div>
  );
}
