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

  // 본문 HTML 복사 (티스토리 블로그용 - 네이버N과 동일한 디자인 적용)
  const handleCopyHtmlT = async () => {
    if (!contentRef?.current || !descriptionRef?.current) return;

    try {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      // 1. 요약 박스 (네이버N과 동일한 스타일)
      const summaryText = descriptionRef.current.innerText;
      const summaryHtml = `
        <div style="margin: 20px 0; padding: 25px 30px; border-left: 5px solid #14b8a6; background-color: #f0fdfa; border-radius: 0 10px 10px 0; text-align: left;">
          <h3 data-ke-size="size18" style="color: #115e59; line-height: 1.8; margin: 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif; letter-spacing: -0.5px; font-weight: normal;">
            ${summaryText}
          </h3>
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

      // 제목 스타일 처리
      const h1Style =
        "color: #059669; font-size: 24px; font-weight: bold; margin: 40px 0 20px 0; line-height: 1.4; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h1[^>]*>(.*?)<\/h1>/gi,
        `<h1 style="${h1Style}">$1</h1>`,
      );

      const h2Style =
        "color: #000000; font-size: 22px; font-weight: bold; margin: 35px 0 15px 0; line-height: 1.4; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h2[^>]*>(.*?)<\/h2>/gi,
        `<h2 style="${h2Style}">$1</h2>`,
      );

      const h3Style =
        "color: #059669; font-size: 20px; font-weight: bold; margin: 35px 0 15px 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h3[^>]*>(.*?)<\/h3>/gi,
        `<h3 style="${h3Style}">$1</h3>`,
      );

      // 특정 중요 헤더 텍스트 스타일링
      const specialHeaders = [
        "📋 요리 정보 (Cooking Info)",
        "🛒 오늘의 재료 (Today's Ingredients)",
        "🍳 요리 가이드 (Cooking Guide)",
      ];

      specialHeaders.forEach((header) => {
        const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const reg = new RegExp(escaped, "g");
        const needsExtraSpace =
          header.includes("오늘의 재료") || header.includes("요리 가이드");
        const prefix = needsExtraSpace ? "<br />" : "";
        bodyHtml = bodyHtml.replace(
          reg,
          `${prefix}<h1 data-ke-size="size32" style="color: #059669; font-size: 30px; font-weight: bold; margin: 20px 0;">${header}</h1>`,
        );
      });

      // 단락 p 스타일
      const pStyle =
        "color: #333333; font-size: 17px; line-height: 1.9; margin: 15px 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif; word-break: break-all;";
      bodyHtml = bodyHtml.replace(
        /<p[^>]*>(.*?)<\/p>/gi,
        `<p style="${pStyle}">$1</p>`,
      );

      // 이미지 스타일
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

      // [최종 처리 1] 오늘의 재료 섹션 스타일링
      const ingredientsSectionPattern =
        /(🛒 오늘의 재료 \(Today's Ingredients\)<\/h1>)([\s\S]*?)(<br \/><h1[^>]*>🍳 요리 가이드 \(Cooking Guide\))/gi;

      bodyHtml = bodyHtml.replace(
        ingredientsSectionPattern,
        (_match: string, header1: string, content: string, header2: string) => {
          const styledContent = content.replace(
            /<([a-z1-6]+)([^>]*)>(.*?)<\/\1>/gi,
            (
              _tagMatch: string,
              tagName: string,
              _attributes: string,
              innerText: string,
            ) => {
              if (
                tagName.toLowerCase() === "img" ||
                tagName.toLowerCase() === "br" ||
                innerText.trim() === ""
              )
                return _tagMatch;

              // 제목3(H3, ###) 스타일 적용
              return `<h3 data-ke-size="size18" style="color: #000000 !important; font-weight: normal !important; line-height: 1.8 !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important; margin: 10px 0;">${innerText}</h3>`;
            },
          );
          return `${header1}<div style="color: #000000; line-height: 1.8;">${styledContent}</div>${header2}`;
        },
      );

      // [최종 처리 2] 요리 가이드 섹션 스타일링
      const cookingGuideParts = bodyHtml.split(
        /<h1[^>]*>🍳 요리 가이드 \(Cooking Guide\)<\/h1>/i,
      );
      if (cookingGuideParts.length > 1) {
        const headerPart =
          cookingGuideParts[0] +
          '<h1 data-ke-size="size32" style="color: #059669; font-size: 30px; font-weight: bold; margin: 20px 0;">🍳 요리 가이드 (Cooking Guide)</h1>';
        let remainingContent = cookingGuideParts
          .slice(1)
          .join(
            '<h1 data-ke-size="size32" style="color: #059669; font-size: 30px; font-weight: bold; margin: 20px 0;">🍳 요리 가이드 (Cooking Guide)</h1>',
          );

        // 1. 모든 태그에 기본 스타일 적용 (리스트 포함)
        remainingContent = remainingContent.replace(
          /<([a-z1-6]+)([^>]*)>(.*?)<\/\1>/gi,
          (
            _tagMatch: string,
            tagName: string,
            attributes: string,
            innerContent: string,
          ) => {
            const lowerTag = tagName.toLowerCase();
            if (lowerTag === "img" || lowerTag === "br") return _tagMatch;

            // 리스트 태그(ol, ul)와 항목(li)에 대해 20px 강제 적용
            const isListTag =
              lowerTag === "ol" || lowerTag === "ul" || lowerTag === "li";
            const fontSize = isListTag ? "20px" : "18px";
            const keSize = isListTag ? "size20" : "size18";

            // 사용자가 요청한 리스트 아이템 스타일 최우선 적용
            const baseStyle = `font-size: ${fontSize} !important; line-height: 1.8 !important; color: #333333 !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important;`;

            if (attributes.includes("style=")) {
              return `<${tagName}${attributes.replace(/style="[^"]*"/, `style="${baseStyle}"`)} data-ke-size="${keSize}">${innerContent}</${tagName}>`;
            } else {
              return `<${tagName}${attributes} style="${baseStyle}" data-ke-size="${keSize}">${innerContent}</${tagName}>`;
            }
          },
        );

        remainingContent = remainingContent.replace(
          /(>|^|\s)(\d+\.)(\s)/g,
          (_match, prefix, num, suffix) => {
            return `${prefix}<span style="color: #888888 !important; font-size: 24px !important; font-weight: bold !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important;">${num}</span>${suffix}`;
          },
        );
        bodyHtml = headerPart + remainingContent;
      }

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

      // 제목 스타일 처리
      const h1Style =
        "color: #059669; font-size: 24px; font-weight: bold; margin: 40px 0 20px 0; line-height: 1.4; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h1[^>]*>(.*?)<\/h1>/gi,
        `<h1 style="${h1Style}">$1</h1>`,
      );

      // 제목 h2 스타일 (네이버는 큰 제목 선호)
      const h2Style =
        "color: #000000; font-size: 22px; font-weight: bold; margin: 35px 0 15px 0; line-height: 1.4; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h2[^>]*>(.*?)<\/h2>/gi,
        `<h2 style="${h2Style}">$1</h2>`,
      );

      // 제목 h3 스타일 (요리 정보, 오늘의 재료, 요리 가이드 등)
      const h3Style =
        "color: #059669; font-size: 20px; font-weight: bold; margin: 35px 0 15px 0; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif;";
      bodyHtml = bodyHtml.replace(
        /<h3[^>]*>(.*?)<\/h3>/gi,
        `<h3 style="${h3Style}">$1</h3>`,
      );

      // 특정 중요 헤더 텍스트 색상 및 크기 강제 지정 (text-emerald-600: #059669, font-size: 30px)
      const specialHeaders = [
        "📋 요리 정보 (Cooking Info)",
        "🛒 오늘의 재료 (Today's Ingredients)",
        "🍳 요리 가이드 (Cooking Guide)",
      ];

      specialHeaders.forEach((header) => {
        const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const reg = new RegExp(escaped, "g");

        // "오늘의 재료"와 "요리 가이드" 헤더 위에 빈 줄 추가
        const needsExtraSpace =
          header.includes("오늘의 재료") || header.includes("요리 가이드");
        const prefix = needsExtraSpace ? "<br />" : "";

        bodyHtml = bodyHtml.replace(
          reg,
          `${prefix}<span style="color: #059669; font-size: 30px; font-weight: bold;">${header}</span>`,
        );
      });

      // 단락 p 스타일 (네이버 기본 폰트 감안) - 위에서 처리되지 않은 나머지 p 태그들 전용
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

      // [최종 처리] 오늘의 재료와 요리 가이드 사이의 텍스트 스타일링 (검은색, 크기 24px, 굵기 제거)
      const ingredientsSectionPattern =
        /(🛒 오늘의 재료 \(Today's Ingredients\)<\/span>)([\s\S]*?)(<br \/><span[^>]*>🍳 요리 가이드 \(Cooking Guide\))/gi;

      bodyHtml = bodyHtml.replace(
        ingredientsSectionPattern,
        (_match: string, header1: string, content: string, header2: string) => {
          // 섹션 내부의 모든 HTML 태그들에 스타일 적용 (기존 스타일 덮어쓰기)
          const styledContent = content.replace(
            /<([a-z1-6]+)([^>]*)>/gi,
            (_tagMatch: string, tagName: string, attributes: string) => {
              // 이미지 태그 등 스타일링에서 제외할 태그 처리 (필요시)
              if (
                tagName.toLowerCase() === "img" ||
                tagName.toLowerCase() === "br"
              )
                return _tagMatch;

              const baseStyle =
                "color: #000000 !important; font-size: 24px !important; font-weight: normal !important; line-height: 1.8 !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important;";

              // 기존 style 속성이 있으면 교체, 없으면 추가
              if (attributes.includes("style=")) {
                return `<${tagName}${attributes.replace(/style="[^"]*"/, `style="${baseStyle}"`)}>`;
              } else {
                return `<${tagName}${attributes} style="${baseStyle}">`;
              }
            },
          );

          return `${header1}<div style="color: #000000; font-size: 24px; font-weight: normal; line-height: 1.8;">${styledContent}</div>${header2}`;
        },
      );

      // [최종 처리 2] 요리 가이드 이후의 텍스트 스타일링 (글자 크기 20px, 숫자 24px + 회색)
      const cookingGuideParts = bodyHtml.split(
        /<span[^>]*>🍳 요리 가이드 \(Cooking Guide\)<\/span>/i,
      );
      if (cookingGuideParts.length > 1) {
        const headerPart =
          cookingGuideParts[0] +
          '<span style="color: #059669; font-size: 30px; font-weight: bold;">🍳 요리 가이드 (Cooking Guide)</span>';
        let remainingContent = cookingGuideParts
          .slice(1)
          .join(
            '<span style="color: #059669; font-size: 30px; font-weight: bold;">🍳 요리 가이드 (Cooking Guide)</span>',
          );

        // 1. 모든 태그에 font-size: 20px 적용
        remainingContent = remainingContent.replace(
          /<([a-z1-6]+)([^>]*)>/gi,
          (_tagMatch: string, tagName: string, attributes: string) => {
            if (
              tagName.toLowerCase() === "img" ||
              tagName.toLowerCase() === "br"
            )
              return _tagMatch;

            const baseStyle =
              "color: #333333 !important; font-size: 20px !important; font-weight: normal !important; line-height: 1.8 !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important;";

            if (attributes.includes("style=")) {
              return `<${tagName}${attributes.replace(/style="[^"]*"/, `style="${baseStyle}"`)}>`;
            } else {
              return `<${tagName}${attributes} style="${baseStyle}">`;
            }
          },
        );

        // 2. 숫자(1., 2., 3.) 스타일링: 글자 크기 24px, 회색(#888888)
        remainingContent = remainingContent.replace(
          /(>|^|\s)(\d+\.)(\s)/g,
          (_match, prefix, num, suffix) => {
            return `${prefix}<span style="color: #888888 !important; font-size: 24px !important; font-weight: bold !important; font-family: 'NanumGothic', 'Malgun Gothic', sans-serif !important;">${num}</span>${suffix}`;
          },
        );

        bodyHtml = headerPart + remainingContent;
      }

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
