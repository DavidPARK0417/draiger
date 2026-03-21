"use client";

import React from "react";
import { Copy, Check } from "lucide-react";

interface PromptCopySectionProps {
  prompts: (string | undefined)[];
}

export default function PromptCopySection({ prompts }: PromptCopySectionProps) {
  const [activeButton, setActiveButton] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string | undefined, index: number) => {
    try {
      const content = text || " "; // 내용이 없으면 형식적으로 빈칸으로 복사
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = content;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setActiveButton(index);
      window.setTimeout(() => setActiveButton(null), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
      setActiveButton(null);
    }
  };

  // 정확히 prompt1 ~ prompt6 (총 6개)를 표시
  const promptList = prompts.slice(0, 6);
  // 만약 prompts 배열 길이가 6보다 작으면 6개가 되도록 빈 요소 채우기
  while (promptList.length < 6) {
    promptList.push(undefined);
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4 mb-6">
      {promptList.map((prompt, index) => (
        <button
          key={`prompt-${index}`}
          type="button"
          onClick={() => copyToClipboard(prompt, index)}
          className="
            inline-flex items-center gap-2
            px-3 py-2
            rounded-lg
            text-xs sm:text-sm
            font-medium
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-200
            shadow-sm hover:shadow-md
            transition-all duration-300
            hover:-translate-y-0.5 hover:border-emerald-500 dark:hover:border-emerald-500
          "
          aria-label={`Prompt ${index + 1} 복사`}
        >
          {activeButton === index ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">복사 완료!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-emerald-500" />
              <span>Prompt {index + 1}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
