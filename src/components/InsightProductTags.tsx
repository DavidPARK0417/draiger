"use client";

import React from "react";
import { ShoppingBag, Copy, Check } from "lucide-react";

interface InsightProductTagsProps {
  products: string[];
}

export default function InsightProductTags({
  products,
}: InsightProductTagsProps) {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium shrink-0">
        <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
        <span>추천 상품</span>
      </div>
      {products.map((product, index) => {
        const isCopied = copiedIndex === index;
        return (
          <button
            key={`product-tag-${index}`}
            type="button"
            onClick={() => copyToClipboard(product, index)}
            aria-label={`${product} 복사`}
            className={`
              inline-flex items-center gap-1.5
              px-2.5 py-1
              rounded-full
              text-xs font-medium
              border
              transition-all duration-200
              cursor-pointer
              ${
                isCopied
                  ? "bg-emerald-500 dark:bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-sm"
              }
            `}
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 shrink-0" />
                <span>복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 shrink-0 opacity-50" />
                <span>{product}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
