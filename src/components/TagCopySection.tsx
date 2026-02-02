"use client";

import React from "react";
import { Copy, Check, FileText, Hash } from "lucide-react";

interface TagCopySectionProps {
  title: string;
  tags: string[];
  contentRef?: React.RefObject<HTMLDivElement | null>;
  descriptionRef?: React.RefObject<HTMLDivElement | null>;
}

export default function TagCopySection({
  title,
  tags,
  contentRef,
  descriptionRef,
}: TagCopySectionProps) {
  const [activeButton, setActiveButton] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async (text: string, buttonId: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setActiveButton(buttonId);
      window.setTimeout(() => setActiveButton(null), 2000);
    } catch {
      setActiveButton(null);
    }
  };

  // 제목 복사
  const handleCopyTitle = () => {
    if (!title) return;
    void copyToClipboard(title, "title");
  };

  // 태그1: # 없이 쉼표로 구분
  const handleCopyTag1 = () => {
    if (!tags || tags.length === 0) return;
    const copyText = tags.join(", ");
    void copyToClipboard(copyText, "tag1");
  };

  // 태그2: # 포함, 공백으로 구분
  const handleCopyTag2 = () => {
    if (!tags || tags.length === 0) return;
    const copyText = tags.map((tag) => `#${tag}`).join(" ");
    void copyToClipboard(copyText, "tag2");
  };

  // 본문 HTML 복사 (티스토리 블로그용 - 극강의 호환성 Table 레이아웃)
  const handleCopyHtmlT = async () => {
    if (!contentRef?.current || !descriptionRef?.current) return;

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      // 1. 요약 박스 (이미지 기반 스타일)
      const summaryText = descriptionRef.current.innerText;
      const summaryHtml = `
        <div style="margin: 30px 0; padding: 25px 30px; border-left: 5px solid #10b981; background-color: #f0fdfa; text-align: left; border-radius: 0 8px 8px 0; text-decoration: none !important;">
          <p style="color: #115e59; font-size: 18px; line-height: 1.8; margin: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; letter-spacing: -0.01em; text-decoration: none !important; border: none !important;">
            ${summaryText}
          </p>
        </div>
      `;

      // 2. 본문 내용 가공
      let bodyHtml = contentRef.current.innerHTML;

      // 이미지 경로를 절대 경로로 치환
      bodyHtml = bodyHtml.replace(
        /src="\/api\/proxy-image\?url=([^"]+)"/g,
        `src="${baseUrl}/api/proxy-image?url=$1"`,
      );
      bodyHtml = bodyHtml.replace(/src="\/([^"]+)"/g, (match, path) =>
        path.startsWith("api/") ? match : `src="${baseUrl}/${path}"`,
      );

      // 본문 스타일링 (태그 필터링 및 인라인 스타일 주입)

      // 제목 h2 스타일링
      const h2Style =
        "color: #0f172a; font-size: 28px; font-weight: 800; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-top: 60px; margin-bottom: 24px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; letter-spacing: -0.02em; text-decoration: none !important;";
      bodyHtml = bodyHtml.replace(
        /<h2[^>]*>(.*?)<\/h2>/gi,
        `<h2 style="${h2Style}">$1</h2>`,
      );

      // 제목 h3 스타일링
      const h3Style =
        "color: #059669; font-size: 22px; font-weight: 700; margin-top: 40px; margin-bottom: 16px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; text-decoration: none !important;";
      bodyHtml = bodyHtml.replace(
        /<h3[^>]*>(.*?)<\/h3>/gi,
        `<h3 style="${h3Style}">$1</h3>`,
      );

      // 단락 p 스타일링
      const pStyle =
        "color: #334155; font-size: 18px; line-height: 1.8; margin: 18px 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; text-decoration: none !important; border-bottom: none !important;";
      bodyHtml = bodyHtml.replace(
        /<p[^>]*>(.*?)<\/p>/gi,
        `<p style="${pStyle}">$1</p>`,
      );

      // 이미지 스타일링 (가로 100% 대응)
      bodyHtml = bodyHtml.replace(
        /<img([^>]+)>/gi,
        '<div style="text-align: center; margin: 35px 0; text-decoration: none !important;"><img $1 style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);"></div>',
      );

      // 리스트 스타일링
      const listStyle =
        "color: #334155; font-size: 18px; line-height: 1.8; margin-bottom: 20px; padding-left: 25px; text-decoration: none !important;";
      bodyHtml = bodyHtml.replace(
        /<ul[^>]*>/gi,
        `<ul style="${listStyle} list-style-type: disc;">`,
      );
      bodyHtml = bodyHtml.replace(
        /<ol[^>]*>/gi,
        `<ul style="${listStyle} list-style-type: decimal;">`,
      ); // 티스토리 호환성을 위해 ul로 대체하되 스타일로 구분
      bodyHtml = bodyHtml.replace(
        /<li[^>]*>/gi,
        "<li style='margin-bottom: 10px; text-decoration: none !important;'>",
      );

      // 강조 텍스트
      bodyHtml = bodyHtml.replace(
        /<strong[^>]*>/gi,
        "<strong style='color: #0f172a; font-weight: 700; text-decoration: none !important;'>",
      );

      // 가로 구분선
      bodyHtml = bodyHtml.replace(
        /<hr[^>]*>/gi,
        '<hr style="border: 0; border-top: 2px solid #f1f5f9; margin: 50px 0; text-decoration: none !important;">',
      );

      // 인용구
      const bqStyle =
        "border-left: 4px solid #cbd5e1; padding: 16px 24px; margin: 30px 0; background-color: #f8fafc; color: #475569; italic; font-size: 17px; text-decoration: none !important;";
      bodyHtml = bodyHtml.replace(
        /<blockquote[^>]*>/gi,
        `<blockquote style="${bqStyle}">`,
      );

      // 전체 결합
      const combinedHtml = `
        <div style="background-color: #ffffff; padding: 20px; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'noto sans', sans-serif; text-decoration: none !important;">
          ${summaryHtml}
          <div style="margin-top: 50px; text-decoration: none !important;">
            ${bodyHtml}
          </div>
        </div>
      `;

      const blobHtml = new Blob([combinedHtml], { type: "text/html" });
      const blobText = new Blob(
        [`${summaryText}\n\n${contentRef.current.innerText}`],
        { type: "text/plain" },
      );

      const data = [
        new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        }),
      ];

      await navigator.clipboard.write(data);

      setActiveButton("htmlT");
      window.setTimeout(() => setActiveButton(null), 2000);
    } catch (err) {
      console.error("티스토리 본문 복사 실패:", err);
    }
  };

  // 본문 HTML 복사 (네이버 블로그용 - 스마트에디터 ONE 최적화)
  const handleCopyHtmlN = async () => {
    if (!contentRef?.current || !descriptionRef?.current) return;

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      // 1. 요약 박스 (네이버 최적화: 단순 Div 구조 + 명확한 인라인 스타일)
      const summaryText = descriptionRef.current.innerText;
      const summaryHtml = `
        <div style="margin: 20px 0; padding: 25px 30px; border-left: 5px solid #14b8a6; background-color: #f0fdfa; border-radius: 0 10px 10px 0; text-align: left;">
          <p style="color: #115e59; font-size: 17px; line-height: 1.8; margin: 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif; letter-spacing: -0.5px;">
            ${summaryText}
          </p>
        </div>
      `;

      // 2. 본문 내용 가공
      let bodyHtml = contentRef.current.innerHTML;

      // 이미지 경로를 절대 경로로 치환
      bodyHtml = bodyHtml.replace(
        /src="\/api\/proxy-image\?url=([^"]+)"/g,
        `src="${baseUrl}/api/proxy-image?url=$1"`,
      );
      bodyHtml = bodyHtml.replace(/src="\/([^"]+)"/g, (match, path) =>
        path.startsWith("api/") ? match : `src="${baseUrl}/${path}"`,
      );

      // 네이버 블로그 스마트에디터 최적화 스타일 주입

      // 제목 h2 스타일 (네이버는 큰 제목 선호)
      const h2Style =
        "color: #000000; font-size: 26px; font-weight: bold; margin: 50px 0 20px 0; line-height: 1.4; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h2[^>]*>(.*?)<\/h2>/gi,
        `<h2 style="${h2Style}">$1</h2>`,
      );

      // 제목 h3 스타일
      const h3Style =
        "color: #14b8a6; font-size: 20px; font-weight: bold; margin: 35px 0 15px 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h3[^>]*>(.*?)<\/h3>/gi,
        `<h3 style="${h3Style}">$1</h3>`,
      );

      // 단락 p 스타일 (네이버 기본 폰트 감안)
      const pStyle =
        "color: #333333; font-size: 17px; line-height: 1.9; margin: 15px 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif; word-break: break-all;";
      bodyHtml = bodyHtml.replace(
        /<p[^>]*>(.*?)<\/p>/gi,
        `<p style="${pStyle}">$1</p>`,
      );

      // 이미지 스타일 (네이버 에디터 대응: 중앙 정렬 강조)
      bodyHtml = bodyHtml.replace(
        /<img([^>]+)>/gi,
        '<div style="text-align: center; margin: 40px 0;"><img $1 style="max-width: 100%; height: auto; border-radius: 8px;"></div>',
      );

      // 리스트 스타일
      const listStyle =
        "color: #333333; font-size: 17px; line-height: 1.8; margin: 15px 0; padding-left: 20px; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(/<ul[^>]*>/gi, `<ul style="${listStyle}">`);
      bodyHtml = bodyHtml.replace(/<ol[^>]*>/gi, `<ol style="${listStyle}">`);
      bodyHtml = bodyHtml.replace(
        /<li[^>]*>/gi,
        "<li style='margin-bottom: 8px;'>",
      );

      // 강조 및 인용구
      bodyHtml = bodyHtml.replace(
        /<strong[^>]*>/gi,
        "<strong style='color: #000000; font-weight: bold;'>",
      );
      const bqStyle =
        "border-left: 4px solid #d1d5db; padding: 15px 25px; margin: 30px 0; background-color: #f9fafb; color: #666666; font-size: 16px; italic;";
      bodyHtml = bodyHtml.replace(
        /<blockquote[^>]*>/gi,
        `<blockquote style="${bqStyle}">`,
      );

      // 전체 결합
      const combinedHtml = `
        <div style="font-family: 'NanumGothic', 'Malgun Gothic', sans-serif; font-size: 17px; color: #333333; line-height: 1.8; padding: 20px; max-width: 800px; margin: 0 auto;">
          ${summaryHtml}
          <div style="margin-top: 40px;">
            ${bodyHtml}
          </div>
        </div>
      `;

      const blobHtml = new Blob([combinedHtml], { type: "text/html" });
      const blobText = new Blob(
        [`${summaryText}\n\n${contentRef.current.innerText}`],
        { type: "text/plain" },
      );

      const data = [
        new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        }),
      ];

      await navigator.clipboard.write(data);

      setActiveButton("htmlN");
      window.setTimeout(() => setActiveButton(null), 2000);
    } catch (err) {
      console.error("네이버 본문 복사 실패:", err);
    }
  };

  // Hydration mismatch 방지: 서버와 클라이언트의 초기 렌더링을 맞춤
  if (!mounted) {
    return (
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:gap-4 h-24" />
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tags.map((tag, index) => (
            <span
              key={`tag-${tag}-${index}`}
              className="
                inline-flex items-center
                px-3 py-1.5 sm:px-4 sm:py-2
                rounded-full
                text-xs sm:text-sm
                font-medium
                bg-emerald-50 dark:bg-emerald-900/30
                text-emerald-700 dark:text-emerald-300
                border border-emerald-200 dark:border-emerald-700/50
                transition-colors duration-300
              "
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <button
            type="button"
            onClick={handleCopyTitle}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              text-xs sm:text-sm
              font-medium
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              shadow-sm hover:shadow-md active:shadow
              transition-all duration-300
              hover:-translate-y-0.5 active:scale-98
              self-start
            "
            aria-label="제목 복사"
          >
            {activeButton === "title" ? (
              <>
                <Check className="w-4 h-4" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>제목</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyHtmlT}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              text-xs sm:text-sm
              font-medium
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              shadow-sm hover:shadow-md active:shadow
              transition-all duration-300
              hover:-translate-y-0.5 active:scale-98
              self-start
            "
            aria-label="본문T 복사"
          >
            {activeButton === "htmlT" ? (
              <>
                <Check className="w-4 h-4" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>본문T</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyHtmlN}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              text-xs sm:text-sm
              font-medium
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              shadow-sm hover:shadow-md active:shadow
              transition-all duration-300
              hover:-translate-y-0.5 active:scale-98
              self-start
            "
            aria-label="본문N 복사"
          >
            {activeButton === "htmlN" ? (
              <>
                <Check className="w-4 h-4" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>본문N</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyTag1}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              text-xs sm:text-sm
              font-medium
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              shadow-sm hover:shadow-md active:shadow
              transition-all duration-300
              hover:-translate-y-0.5 active:scale-98
              self-start
            "
            aria-label="태그T 복사"
          >
            {activeButton === "tag1" ? (
              <>
                <Check className="w-4 h-4" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                <span>태그T</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyTag2}
            className="
              inline-flex items-center gap-2
              px-4 py-2.5
              rounded-lg
              text-xs sm:text-sm
              font-medium
              bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              shadow-sm hover:shadow-md active:shadow
              transition-all duration-300
              hover:-translate-y-0.5 active:scale-98
              self-start
            "
            aria-label="태그N 복사"
          >
            {activeButton === "tag2" ? (
              <>
                <Check className="w-4 h-4" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                <span>태그N</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
