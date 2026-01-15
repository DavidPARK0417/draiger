"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AdFitProps {
  unitId: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * 카카오 애드핏 광고 컴포넌트
 * 
 * @param unitId - 카카오 애드핏 광고 단위 ID (필수)
 * @param width - 광고 너비 (기본값: 320)
 * @param height - 광고 높이 (기본값: 100)
 * @param className - 추가 CSS 클래스
 * 
 * @example
 * ```tsx
 * <AdFit
 *   unitId="1234567890"
 *   width={320}
 *   height={100}
 *   className="my-8"
 * />
 * ```
 */
export default function AdFit({
  unitId,
  width = 320,
  height = 100,
  className = "",
}: AdFitProps) {
  useEffect(() => {
    // 광고 스크립트가 로드된 후 실행
    if (typeof window !== "undefined" && (window as any).kakao) {
      try {
        (window as any).kakao.ads.display();
      } catch (error) {
        console.error("카카오 애드핏 광고 표시 오류:", error);
      }
    }
  }, []);

  return (
    <div className={`adfit-container ${className}`}>
      <ins
        className="kakao_ad_area"
        style={{ display: "none" }}
        data-ad-unit={unitId}
        data-ad-width={width}
        data-ad-height={height}
      />
      <Script
        type="text/javascript"
        src="https://t1.daumcdn.net/kas/static/ba.min.js"
        async
        strategy="lazyOnload"
        onLoad={() => {
          // 스크립트 로드 완료 후 광고 표시
          if (typeof window !== "undefined" && (window as any).kakao) {
            try {
              (window as any).kakao.ads.display();
            } catch (error) {
              console.error("카카오 애드핏 광고 표시 오류:", error);
            }
          }
        }}
      />
    </div>
  );
}

