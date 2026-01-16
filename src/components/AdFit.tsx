"use client";

import { useEffect, useRef, useState } from "react";

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
  kakao?: {
    display: (element: HTMLElement) => void;
  };
}

/**
 * 카카오 애드핏 광고 컴포넌트
 *
 * AdFit Web SDK 가이드에 따라 구현된 광고 컴포넌트입니다.
 * 광고 요청 실패 시 NO-AD 콜백 함수를 지원합니다.
 *
 * 브라우저 호환성 개선:
 * - Edge, 네이버웨일 등 다양한 브라우저에서 광고가 정상적으로 표시되도록 개선
 * - 스크립트 로드 상태를 확인하여 안정적으로 광고를 표시
 *
 * 핵심 동작 원리:
 * 1. layout.tsx에서 Kakao AdFit 스크립트를 전역으로 한 번만 로드
 * 2. 스크립트 로드 완료를 확인한 후 광고 영역을 표시
 * 3. 이 컴포넌트는 <ins> 태그에 광고 정보를 data 속성으로 설정
 * 4. Kakao AdFit 스크립트가 자동으로 모든 <ins> 태그를 인식하여 광고를 표시
 * 5. 브라우저 호환성을 위해 명시적으로 display() 함수 호출
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
  const [isScriptReady, setIsScriptReady] = useState(false);

  // AdFit 스크립트 로드 확인
  useEffect(() => {
    const checkScript = () => {
      if (typeof window === "undefined") {
        return false;
      }

      // 스크립트 태그가 DOM에 있는지 확인
      const scriptTag = document.querySelector(
        'script[src*="ba.min.js"]'
      ) as HTMLScriptElement;
      if (!scriptTag) {
        return false;
      }

      // 스크립트가 로드되었는지 확인 (여러 방법 시도)
      const windowWithKakao = window as unknown as WindowWithKakao;

      // 방법 1: kakao 객체 확인
      if (windowWithKakao.kakao || (window as any).kakao) {
        console.log("[AdFit] kakao 객체 발견", { unitId });
        return true;
      }

      // 방법 2: 스크립트 태그의 완료 상태 확인
      // 스크립트가 완전히 로드되었는지 확인하기 위해 스크립트 태그의 속성 확인
      if (scriptTag.getAttribute("data-loaded") === "true") {
        return true;
      }

      // 방법 3: 전역 변수 확인 (카카오 AdFit이 설정하는 다른 전역 변수)
      if ((window as any).__kakao_adfit_loaded) {
        return true;
      }

      return false;
    };

    // 스크립트 태그에 로드 완료 마커 추가
    const markScriptAsLoaded = () => {
      const scriptTag = document.querySelector(
        'script[src*="ba.min.js"]'
      ) as HTMLScriptElement;
      if (scriptTag) {
        scriptTag.setAttribute("data-loaded", "true");
      }
    };

    // 스크립트 로드 이벤트 리스너 추가
    const scriptTag = document.querySelector(
      'script[src*="ba.min.js"]'
    ) as HTMLScriptElement;
    if (scriptTag) {
      scriptTag.addEventListener("load", () => {
        console.log("[AdFit] 스크립트 로드 이벤트 발생", { unitId });
        markScriptAsLoaded();
        // 약간의 지연 후 kakao 객체가 생성될 때까지 대기
        setTimeout(() => {
          if (checkScript()) {
            setIsScriptReady(true);
          }
        }, 100);
      });

      scriptTag.addEventListener("error", () => {
        console.error("[AdFit] 스크립트 로드 실패", { unitId });
      });
    }

    // 즉시 확인
    if (checkScript()) {
      setIsScriptReady(true);
      return;
    }

    // 주기적으로 확인 (최대 10초로 증가)
    let attempts = 0;
    const maxAttempts = 100; // 10초 (100ms * 100)
    const interval = setInterval(() => {
      attempts++;
      if (checkScript()) {
        setIsScriptReady(true);
        clearInterval(interval);
        markScriptAsLoaded();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn("[AdFit] 스크립트 로드 타임아웃", {
          unitId,
          scriptTagExists: !!scriptTag,
          documentReady: document.readyState,
        });
        // 타임아웃이어도 시도해볼 수 있도록 준비 완료로 표시
        // 카카오 AdFit은 자동 스캔을 하므로 kakao 객체가 없어도 작동할 수 있음
        setIsScriptReady(true);
      }
    }, 100);

    // DOMContentLoaded 이벤트도 확인
    if (document.readyState === "loading") {
      const handleDOMContentLoaded = () => {
        setTimeout(() => {
          if (checkScript()) {
            setIsScriptReady(true);
            clearInterval(interval);
            markScriptAsLoaded();
          }
        }, 500);
      };
      document.addEventListener("DOMContentLoaded", handleDOMContentLoaded);

      return () => {
        clearInterval(interval);
        document.removeEventListener(
          "DOMContentLoaded",
          handleDOMContentLoaded
        );
      };
    }

    // window.load 이벤트도 확인 (모든 리소스 로드 완료 후)
    const handleWindowLoad = () => {
      setTimeout(() => {
        if (checkScript()) {
          setIsScriptReady(true);
          clearInterval(interval);
          markScriptAsLoaded();
        }
      }, 500);
    };

    if (document.readyState === "complete") {
      handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("load", handleWindowLoad);
    };
  }, [unitId]);

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

  // 스크립트가 준비되면 광고 영역 표시 및 광고 로드
  useEffect(() => {
    if (!isScriptReady || !insRef.current) {
      return;
    }

    const element = insRef.current;
    if (!element) return;

    // visibility를 visible로 변경하여 표시 (display: none 대신 사용)
    element.style.visibility = "visible";
    element.style.display = "";

    const windowWithKakao = window as unknown as WindowWithKakao;
    let displayAttempts = 0;

    // 광고 표시 함수
    const displayAd = () => {
      displayAttempts++;

      // 카카오 AdFit은 스크립트가 로드되면 자동으로 kakao_ad_area 클래스를 가진
      // 모든 <ins> 태그를 스캔하여 광고를 표시합니다.
      // 따라서 display() 함수를 호출하지 않아도 작동해야 하지만,
      // 일부 브라우저에서는 명시적으로 호출해야 할 수 있습니다.

      // 방법 1: kakao.display() 함수 호출 (가장 확실한 방법)
      if (windowWithKakao.kakao?.display) {
        try {
          console.log("[AdFit] kakao.display() 호출", { unitId });
          windowWithKakao.kakao.display(element as HTMLElement);
        } catch (error) {
          console.error("[AdFit] kakao.display() 오류", { unitId, error });
        }
      } else {
        // kakao 객체가 없어도 카카오 AdFit은 자동 스캔을 하므로
        // 요소가 보이면 자동으로 인식할 수 있습니다
        // 디버깅을 위한 로그만 출력 (에러가 아님)
        if (displayAttempts <= 3) {
          console.log("[AdFit] kakao 객체 대기 중 (자동 스캔 대기)", {
            unitId,
            attempt: displayAttempts,
          });
        }
      }
    };

    // MutationObserver로 광고 로드 확인
    const observer = new MutationObserver(() => {
      if (element.children.length > 0) {
        console.log("[AdFit] 광고 로드 완료", {
          unitId,
          childrenCount: element.children.length,
        });
        observer.disconnect();
      }
    });

    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // 여러 시점에서 광고 표시 시도 (브라우저 호환성)
    const timeouts: NodeJS.Timeout[] = [];

    // 즉시 시도
    displayAd();

    // 100ms 후 재시도
    timeouts.push(
      setTimeout(() => {
        displayAd();
      }, 100)
    );

    // 500ms 후 재시도
    timeouts.push(
      setTimeout(() => {
        displayAd();
      }, 500)
    );

    // 1초 후 재시도
    timeouts.push(
      setTimeout(() => {
        displayAd();
      }, 1000)
    );

    // window.load 이벤트 후 재시도
    const handleWindowLoad = () => {
      setTimeout(() => {
        displayAd();
      }, 200);
    };

    if (document.readyState === "complete") {
      handleWindowLoad();
    } else {
      window.addEventListener("load", handleWindowLoad);
    }

    // 5초 후 observer 정리
    const timeout = setTimeout(() => {
      observer.disconnect();
      if (element.children.length === 0) {
        console.warn("[AdFit] 광고 로드 타임아웃", {
          unitId,
          hasKakao: !!windowWithKakao.kakao,
          elementVisible: element.style.visibility !== "hidden",
        });
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      timeouts.forEach((t) => clearTimeout(t));
      window.removeEventListener("load", handleWindowLoad);
    };
  }, [isScriptReady, unitId]);

  const callbackName = onFail
    ? `adfitCallback_${unitId.replace(/[^a-zA-Z0-9]/g, "_")}`
    : undefined;

  return (
    <div
      className={`adfit-container ${className}`}
      style={{ position: "relative" }}
    >
      {/* <ins> 태그는 항상 DOM에 렌더링하되, visibility로 숨김 */}
      {/* 이렇게 하면 AdFit 스크립트가 초기 스캔 시 인식할 수 있음 */}
      <ins
        ref={insRef}
        className="kakao_ad_area"
        style={{
          visibility: isScriptReady ? "visible" : "hidden",
          display: "block",
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          minHeight: `${height}px`,
        }}
        data-ad-unit={unitId}
        data-ad-width={width}
        data-ad-height={height}
        {...(callbackName && { "data-ad-onfail": callbackName })}
      />
      {!isScriptReady && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${height}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#6b7280",
            fontSize: "12px",
            pointerEvents: "none",
          }}
          className="dark:bg-gray-800 dark:text-gray-400"
        >
          광고 로딩 중...
        </div>
      )}
    </div>
  );
}
