"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface GiscusCommentsProps {
  slug: string;
}

export default function GiscusComments({ slug }: GiscusCommentsProps) {
  const { theme, systemTheme } = useTheme();
  const commentsRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // 마운트 확인 (중복 실행 방지)
    if (isMountedRef.current) return;
    if (!commentsRef.current) return;

    // 기존 스크립트 제거
    const existingScript = commentsRef.current.querySelector("script");
    if (existingScript) {
      existingScript.remove();
    }

    // 현재 테마 결정 (다크모드 지원)
    const currentTheme =
      theme === "system"
        ? systemTheme === "dark"
          ? "dark"
          : "light"
        : theme === "dark"
          ? "dark"
          : "light";

    // Giscus 스크립트 생성
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "DavidPARK0417/draiger");
    script.setAttribute("data-repo-id", "R_kgDOQtr0bg");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOQtr0bs4C1Box");
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "top");
    script.setAttribute(
      "data-theme",
      currentTheme === "dark" ? "dark" : "light",
    );
    script.setAttribute("data-lang", "ko");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    commentsRef.current.appendChild(script);
    isMountedRef.current = true;

    const currentCommentsRef = commentsRef.current;

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      if (currentCommentsRef && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      isMountedRef.current = false;
    };
  }, [slug, theme, systemTheme]);

  return (
    <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 dark:border-white/10">
      <h2
        className="
        text-xl sm:text-2xl lg:text-3xl
        font-serif font-bold
        mb-6 sm:mb-8
        text-gray-900 dark:text-white
      "
      >
        댓글
      </h2>
      <div ref={commentsRef} className="giscus w-full min-h-[200px]" />
    </div>
  );
}
