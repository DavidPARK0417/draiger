"use client";

import { useEffect, useRef, useState } from "react";

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
  const insRef = useRef<HTMLModElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 클라이언트 마운트 감지 (Hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 스크립트 로드 확인 및 동적 스크립트 추가
  useEffect(() => {
    if (!isMounted) return;

    // 스크립트가 이미 로드되었는지 확인
    const checkScriptLoaded = () => {
      // 방법 1: 스크립트 태그가 DOM에 있는지 확인
      const existingScript = document.querySelector(
        'script[src="https://t1.daumcdn.net/kas/static/ba.min.js"]'
      );

      if (existingScript) {
        // 스크립트 태그가 이미 있으면 로드 이벤트 리스너 추가
        existingScript.addEventListener(
          "load",
          () => {
            console.log("[AdFit] 스크립트 로드 완료:", unitId);
            setScriptLoaded(true);
          },
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => {
            console.error("[AdFit] 스크립트 로드 실패:", unitId);
          },
          { once: true }
        );

        // 스크립트가 이미 로드되었을 수도 있으므로 짧은 지연 후 확인
        setTimeout(() => {
          setScriptLoaded(true);
        }, 500);
      } else {
        // 스크립트 태그가 없으면 동적으로 추가
        console.log("[AdFit] 스크립트 태그가 없어 동적으로 추가:", unitId);
        const script = document.createElement("script");
        script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
        script.async = true;
        script.type = "text/javascript";
        script.charset = "utf-8";

        script.addEventListener(
          "load",
          () => {
            console.log("[AdFit] 동적 스크립트 로드 완료:", unitId);
            setScriptLoaded(true);
          },
          { once: true }
        );

        script.addEventListener(
          "error",
          () => {
            console.error("[AdFit] 동적 스크립트 로드 실패:", unitId);
          },
          { once: true }
        );

        // </body> 바로 앞에 스크립트 추가 (공식 문서 권장 위치)
        document.body.appendChild(script);
      }
    };

    // 초기 확인
    checkScriptLoaded();

    // 폴백: 일정 시간 후 강제로 스크립트 로드로 간주
    // (스크립트가 async로 로드되므로 시간이 걸릴 수 있음)
    const timeout = setTimeout(() => {
      if (!scriptLoaded) {
        console.warn(
          "[AdFit] 스크립트 로드 확인 타임아웃, 광고 초기화 시도:",
          unitId
        );
        setScriptLoaded(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isMounted, unitId]);

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
        console.log("[AdFit] NO-AD 콜백 실행:", unitId);
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

  // 스크립트 로드 후 광고 초기화 시도
  useEffect(() => {
    if (!isMounted || !scriptLoaded || !insRef.current) return;

    // AdFit 스크립트가 자동으로 <ins> 태그를 스캔하지만,
    // 동적으로 추가된 경우 명시적으로 초기화가 필요할 수 있음
    // 공식 문서에 따르면 스크립트가 자동으로 스캔하므로 여기서는 로그만 남김
    console.log("[AdFit] 광고 초기화 준비 완료:", unitId, {
      width,
      height,
      element: insRef.current,
    });
  }, [isMounted, scriptLoaded, unitId, width, height]);

  const callbackName = onFail
    ? `adfitCallback_${unitId.replace(/[^a-zA-Z0-9]/g, "_")}`
    : undefined;

  // 서버에서는 동일한 크기의 빈 div 렌더링, 클라이언트에서만 <ins> 렌더링
  if (!isMounted) {
    return (
      <div
        className={className}
        style={{
          display: "block",
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    );
  }

  // 공식 문서 정확히 준수: <ins class="kakao_ad_area" style="display:none;width:100%;"
  return (
    <ins
      ref={insRef}
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
