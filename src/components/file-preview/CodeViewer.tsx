"use client";

import { useEffect, useState, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Loader2 } from "lucide-react";

interface CodeViewerProps {
  file: File;
}

// 파일 확장자로 언어 감지
function detectLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    java: "java",
    cpp: "cpp",
    c: "c",
    h: "c",
    css: "css",
    html: "html",
    xml: "xml",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    sh: "bash",
    bash: "bash",
    sql: "sql",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    swift: "swift",
    kt: "kotlin",
  };
  return languageMap[ext] || "text";
}

export default function CodeViewer({ file }: CodeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("text");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const abortControllerRef = useRef<AbortController | null>(null);

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

        setProgress(60);
        setProgressMessage("언어 감지 중...");

        const detectedLanguage = detectLanguage(file.name);

        setProgress(80);
        setProgressMessage("완료!");
        setProgress(100);

        // 약간의 지연 후 상태 업데이트
        await new Promise(resolve => setTimeout(resolve, 50));

        setContent(text);
        setLanguage(detectedLanguage);
        setIsLoading(false);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("📄 [코드 뷰어] 읽기 취소됨");
          return;
        }
        console.error("❌ [코드 뷰어] 오류:", err);
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
      <div className="rounded-lg shadow-lg overflow-hidden">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: "1rem",
            fontSize: "0.875rem",
            lineHeight: "1.5",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

