"use client";

import { useState, useCallback } from "react";
import { FileText, Copy, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function CharacterCounterPage() {
  const [text, setText] = useState("");
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [copied, setCopied] = useState(false);

  // 글자수 계산
  const characterCount = includeSpaces
    ? text.length
    : text.replace(/\s/g, "").length;

  // 단어수 계산 (공백으로 구분)
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // 줄 수 계산
  const lineCount = text === "" ? 0 : text.split("\n").length;

  // 바이트 수 계산 (UTF-8 기준)
  const byteCount = new TextEncoder().encode(text).length;

  // 텍스트 복사
  const handleCopy = useCallback(() => {
    if (text.trim() === "") return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        console.log("✅ [글자수 세기] 텍스트 복사 완료");
      })
      .catch((error) => {
        console.error("❌ [글자수 세기] 텍스트 복사 실패:", error);
      });
  }, [text]);

  // 텍스트 초기화
  const handleClear = useCallback(() => {
    setText("");
    console.log("🔄 [글자수 세기] 텍스트 초기화");
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* 헤더 */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1
            className="
            text-2xl sm:text-3xl lg:text-4xl xl:text-5xl
            font-bold mb-4
            text-gray-900 dark:text-white dark:font-extrabold
            leading-tight
          "
          >
            글자수 세기
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            텍스트의 글자수, 단어수, 줄 수를 실시간으로 계산할 수 있습니다. 공백
            포함/제외 옵션을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 왼쪽: 통계 카드 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 글자수 통계 */}
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                통계
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    글자수 {includeSpaces ? "(공백 포함)" : "(공백 제외)"}
                  </span>
                  <span className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                    {characterCount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    단어수
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {wordCount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    줄 수
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lineCount.toLocaleString()}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    바이트 수
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {byteCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* 옵션 */}
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                옵션
              </h2>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSpaces}
                    onChange={(e) => setIncludeSpaces(e.target.checked)}
                    className="
                      w-4 h-4
                      text-emerald-500
                      border-gray-300 dark:border-gray-600
                      rounded
                      focus:ring-emerald-500 dark:focus:ring-emerald-400
                      cursor-pointer
                    "
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    공백 포함
                  </span>
                </label>
              </div>
            </Card>
          </div>

          {/* 오른쪽: 텍스트 입력 영역 */}
          <div className="lg:col-span-2">
            <Card padding="md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  텍스트 입력
                </h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCopy}
                    disabled={text.trim() === ""}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        복사
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleClear}
                    disabled={text === ""}
                  >
                    초기화
                  </Button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  console.log("📝 [글자수 세기] 텍스트 입력:", {
                    length: e.target.value.length,
                    wordCount:
                      e.target.value.trim() === ""
                        ? 0
                        : e.target.value.trim().split(/\s+/).length,
                  });
                }}
                placeholder="여기에 텍스트를 입력하세요..."
                className="
                  w-full
                  min-h-[400px]
                  px-4 py-3
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  text-base
                  focus:outline-none
                  focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                  dark:focus:ring-emerald-400
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  resize-y
                  transition-colors duration-150
                "
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
