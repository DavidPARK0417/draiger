"use client";

import { useEffect, useState, useRef } from "react";
import mammoth from "mammoth";
import { Loader2 } from "lucide-react";

interface WordViewerProps {
  file: File;
}

export default function WordViewer({ file }: WordViewerProps) {
  const [html, setHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const convertWord = async () => {
      // 이전 작업 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        console.log("📄 [Word 뷰어] 변환 시작", { fileName: file.name, fileSize: file.size });

        setProgressMessage("파일 읽는 중...");
        setProgress(20);

        const arrayBuffer = await file.arrayBuffer();
        
        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("Word 문서 변환 중...");
        setProgress(40);

        // requestIdleCallback을 사용하여 변환 작업을 분산
        const result = await new Promise<{ value: string }>((resolve, reject) => {
          const convert = async () => {
            try {
              const res = await mammoth.convertToHtml({ arrayBuffer });
              resolve(res);
            } catch (err) {
              reject(err);
            }
          };

          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => {
              void convert();
            }, { timeout: 1000 });
          } else {
            // 폴백: 즉시 실행
            void convert();
          }
        });

        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("완료!");
        setProgress(100);

        // 약간의 지연 후 상태 업데이트 (UI 반응성 향상)
        await new Promise(resolve => setTimeout(resolve, 100));

        setHtml(result.value);
        setIsLoading(false);

        console.log("✅ [Word 뷰어] 변환 완료");
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("📄 [Word 뷰어] 변환 취소됨");
          return;
        }
        console.error("❌ [Word 뷰어] 오류:", err);
        setError(err instanceof Error ? err.message : "Word 문서를 변환하는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    convertWord();

    // 클린업
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [file]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center w-full max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{progressMessage}</p>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="
          bg-white dark:bg-gray-800
          p-6 sm:p-8 lg:p-12
          rounded-lg
          shadow-lg
          prose prose-sm sm:prose-base lg:prose-lg
          dark:prose-invert
          max-w-none
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

