"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Window 인터페이스 확장 (Lenis 타입 지원)
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Lenis 인스턴스를 전역으로 접근 가능하게 설정 (ScrollToTop 버튼 호환성)
    window.lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      // 클린업 시 전역 참조 제거
      window.lenis = undefined;
    };
  }, []);

  return <>{children}</>;
}

