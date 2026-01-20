"use client";

import { useEffect, useRef } from "react";

interface AdFitProps {
  unitId: string;
  width?: number;
  height?: number;
  className?: string;
  onFail?: (element: HTMLElement) => void;
}

// Window 객체에 동적 콜백 함수 추가를 위한 타입 확장
interface WindowWithKakao extends Window {
  [key: string]: unknown;
}

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * AdFit Web SDK 공식 가이드(https://github.com/adfit/adfit-web-sdk)에 따라 구현되었습니다.
 * 광고 요청 실패 시 NO-AD 콜백 함수를 지원합니다.
 *
 * 공식 문서 준수 사항:
 * 1. <ins class="kakao_ad_area" style="display:none;width:100%;" 형식 정확히 준수
 * 2. data-ad-unit, data-ad-width, data-ad-height 속성 사용
 * 3. layout.tsx에서 스크립트를 </body> 바로 위에 설치 (공식 문서 권장)
 * 4. AdFit 스크립트가 자동으로 <ins> 태그를 스캔하여 광고 표시
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
    if (!onFail) return;

    const callbackName = `adfitCallback_${unitId.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}`;
    callbackNameRef.current = callbackName;

    const windowWithKakao = window as unknown as WindowWithKakao;
    windowWithKakao[callbackName] = (element: HTMLElement) => {
      onFail(element);
    };

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

  // 공식 문서 정확히 준수: <ins class="kakao_ad_area" style="display:none;width:100%;"
  // AdFit 스크립트가 자동으로 <ins> 태그를 스캔하여 광고를 표시합니다
  return (
    <ins
      className={`kakao_ad_area ${className}`}
      style={{
        display: "none", // 공식 문서: display:none (스크립트가 로드되면 자동으로 표시됨)
        width: "100%", // 공식 문서: width:100%
      }}
      data-ad-unit={unitId}
      data-ad-width={width}
      data-ad-height={height}
      {...(callbackName && { "data-ad-onfail": callbackName })}
    />
  );
}
