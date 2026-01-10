"use client";

import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface TextViewerProps {
  file: File;
}

export default function TextViewer({ file }: TextViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMarkdown = file.name.toLowerCase().endsWith(".md");

  useEffect(() => {
    const readFile = async () => {
      // 이전 작업 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        // 큰 파일인지 확인 (10MB 이상)
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
          setProgressMessage(`큰 파일 읽는 중... (${fileSizeMB.toFixed(2)}MB)`);
        } else {
          setProgressMessage("파일 읽는 중...");
        }

        setProgress(30);

        const text = await file.text();
        
        if (abortControllerRef.current?.signal.aborted) return;

        setProgress(80);
        setProgressMessage("완료!");
        setProgress(100);

        // 약간의 지연 후 상태 업데이트
        await new Promise(resolve => setTimeout(resolve, 50));

        setContent(text);
        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("📄 [텍스트 뷰어] 읽기 취소됨");
          return;
        }
        console.error("❌ [텍스트 뷰어] 오류:", err);
        setError(err instanceof Error ? err.message : "파일을 읽는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    readFile();

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
      {isMarkdown ? (
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
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <pre
          className="
            w-full
            p-4 sm:p-6
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            rounded-lg
            shadow-lg
            overflow-x-auto
            text-sm sm:text-base
            font-mono
          "
        >
          {content}
        </pre>
      )}
    </div>
  );
}

