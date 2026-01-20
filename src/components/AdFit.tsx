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
      // 방법 1: window.kakao_adfit 객체가 있는지 확인 (가장 확실한 방법)
      const windowWithKakao = window as unknown as WindowWithKakao;
      if (typeof windowWithKakao.kakao_adfit !== 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.log("[AdFit] 스크립트가 이미 로드됨:", unitId);
        }
        setScriptLoaded(true);
        return;
      }

      // 방법 2: 스크립트 태그가 DOM에 있는지 확인
      const existingScript = document.querySelector(
        'script[src="https://t1.daumcdn.net/kas/static/ba.min.js"]'
      );

      if (existingScript) {
        // 스크립트 태그가 이미 있으면 로드 이벤트 리스너 추가
        existingScript.addEventListener(
          "load",
          () => {
            if (process.env.NODE_ENV === 'development') {
              console.log("[AdFit] 스크립트 로드 완료:", unitId);
            }
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
          if (typeof windowWithKakao.kakao_adfit !== 'undefined') {
            setScriptLoaded(true);
          }
        }, 500);
      } else {
        // 스크립트 태그가 없으면 동적으로 추가
        if (process.env.NODE_ENV === 'development') {
          console.log("[AdFit] 스크립트 태그가 없어 동적으로 추가:", unitId);
        }
        const script = document.createElement("script");
        script.src = "https://t1.daumcdn.net/kas/static/ba.min.js";
        script.async = true;
        script.type = "text/javascript";
        script.charset = "utf-8";

        script.addEventListener(
          "load",
          () => {
            if (process.env.NODE_ENV === 'development') {
              console.log("[AdFit] 동적 스크립트 로드 완료:", unitId);
            }
            // 스크립트 로드 후 약간의 지연을 두고 확인
            setTimeout(() => {
              setScriptLoaded(true);
            }, 100);
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
      const windowWithKakao = window as unknown as WindowWithKakao;
      if (typeof windowWithKakao.kakao_adfit !== 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.log("[AdFit] 타임아웃 후 스크립트 확인 성공:", unitId);
        }
        setScriptLoaded(true);
      } else {
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
        if (process.env.NODE_ENV === 'development') {
          console.log("[AdFit] NO-AD 콜백 실행:", unitId);
        }
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
    if (process.env.NODE_ENV === 'development') {
      console.log("[AdFit] 광고 초기화 준비 완료:", unitId, {
        width,
        height,
        element: insRef.current,
      });
    }

    // AdFit 스크립트가 로드된 후 명시적으로 광고 초기화 시도
    const initAd = () => {
      const windowWithKakao = window as unknown as WindowWithKakao;
      
      if (process.env.NODE_ENV === 'development') {
        console.log("[AdFit] initAd 호출:", unitId, {
          kakao_adfit: typeof windowWithKakao.kakao_adfit,
          insRef: !!insRef.current,
          parent: !!insRef.current?.parentElement,
        });
      }
      
      // AdFit 스크립트가 로드되었는지 확인
      if (typeof windowWithKakao.kakao_adfit !== 'undefined') {
        try {
          // AdFit 스크립트의 스캔 함수 호출 (있는 경우)
          const kakaoAdfit = windowWithKakao.kakao_adfit as { 
            scan?: () => void;
            init?: () => void;
            [key: string]: unknown;
          };
          
          // 방법 1: scan 함수가 있으면 호출
          if (typeof kakaoAdfit.scan === 'function') {
            kakaoAdfit.scan();
            if (process.env.NODE_ENV === 'development') {
              console.log("[AdFit] 수동 스캔 실행:", unitId);
            }
            // scan 함수를 호출한 후에도 <ins> 태그 재추가 시도
          }
          
          // 방법 2: init 함수가 있으면 호출
          if (typeof kakaoAdfit.init === 'function') {
            kakaoAdfit.init();
            if (process.env.NODE_ENV === 'development') {
              console.log("[AdFit] 수동 초기화 실행:", unitId);
            }
            // init 함수를 호출한 후에도 <ins> 태그 재추가 시도
          }
          
          // 방법 3: <ins> 태그를 DOM에서 제거했다가 다시 추가하여 스크립트가 인식하도록 함
          // AdFit 스크립트는 DOM 변경을 감지하여 자동으로 스캔할 수 있음
          // scan/init 함수가 없거나 있어도 재추가를 시도하여 확실하게 인식하도록 함
          if (insRef.current && insRef.current.parentElement) {
            if (process.env.NODE_ENV === 'development') {
              console.log("[AdFit] <ins> 태그 재추가 시작:", unitId);
            }
            
            const parent = insRef.current.parentElement;
            const nextSibling = insRef.current.nextSibling;
            
            // 원본 태그 제거
            const removedElement = parent.removeChild(insRef.current);
            
            // 짧은 지연 후 다시 추가 (AdFit 스크립트가 DOM 변경을 감지하도록)
            setTimeout(() => {
              if (removedElement && parent) {
                // 원본 태그를 다시 추가
                if (nextSibling) {
                  parent.insertBefore(removedElement, nextSibling);
                } else {
                  parent.appendChild(removedElement);
                }
                
                // ref 업데이트
                insRef.current = removedElement as HTMLModElement;
                
                if (process.env.NODE_ENV === 'development') {
                  console.log("[AdFit] <ins> 태그 재추가 완료:", unitId);
                }
              } else {
                if (process.env.NODE_ENV === 'development') {
                  console.warn("[AdFit] <ins> 태그 재추가 실패:", unitId, {
                    removedElement: !!removedElement,
                    parent: !!parent,
                  });
                }
              }
            }, 100);
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn("[AdFit] <ins> 태그 또는 부모 요소가 없음:", unitId, {
                insRef: !!insRef.current,
                parent: !!insRef.current?.parentElement,
              });
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn("[AdFit] 수동 스캔 실패:", error);
          }
        }
      } else {
        // AdFit 스크립트가 아직 로드되지 않았으면 짧은 지연 후 재시도
        if (process.env.NODE_ENV === 'development') {
          console.log("[AdFit] 스크립트 대기 중, 재시도 예정:", unitId);
        }
        setTimeout(() => {
          initAd();
        }, 100);
      }
    };

    // 스크립트가 완전히 로드될 때까지 약간의 지연을 두고 초기화 시도
    // 여러 광고가 있을 경우 순차적으로 초기화되도록 약간의 랜덤 지연 추가
    const delay = Math.random() * 100 + 200; // 200-300ms 사이의 랜덤 지연
    setTimeout(() => {
      initAd();
    }, delay);
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
