"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import JSZip from "jszip";

interface PowerPointViewerProps {
  file: File;
}

interface Slide {
  number: number;
  content: string;
  notes?: string;
}

export default function PowerPointViewer({ file }: PowerPointViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const parsePowerPoint = async () => {
      // 이전 작업 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        console.log("📊 [PowerPoint 뷰어] 파싱 시작", { fileName: file.name, fileSize: file.size });

        setProgressMessage("파일 읽는 중...");
        setProgress(10);

        // PPTX 파일은 ZIP 형식이므로 JSZip으로 압축 해제
        const arrayBuffer = await file.arrayBuffer();
        
        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("압축 해제 중...");
        setProgress(20);

        const zip = await JSZip.loadAsync(arrayBuffer);

        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("슬라이드 목록 찾는 중...");
        setProgress(30);

        // 슬라이드 목록 찾기
        const slideFiles: string[] = [];
        zip.forEach((relativePath, zipEntry) => {
          if (relativePath.startsWith("ppt/slides/slide") && relativePath.endsWith(".xml")) {
            slideFiles.push(relativePath);
          }
        });

        // 슬라이드 번호로 정렬
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || "0");
          const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || "0");
          return numA - numB;
        });

        const parsedSlides: Slide[] = [];
        const totalSlides = slideFiles.length;

        setProgressMessage(`슬라이드 파싱 중... (${totalSlides}개)`);
        setProgress(40);

        // 각 슬라이드 파싱
        for (let i = 0; i < slideFiles.length; i++) {
          if (abortControllerRef.current?.signal.aborted) return;

          const slideFile = slideFiles[i];
          setProgressMessage(`슬라이드 ${i + 1}/${totalSlides} 처리 중...`);
          setProgress(40 + (i / totalSlides) * 50);

          const slideXml = await zip.file(slideFile)?.async("string");

          if (slideXml) {
            // XML에서 텍스트 추출 (간단한 방법)
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(slideXml, "text/xml");

            // a:t 태그에서 텍스트 추출 (PowerPoint의 텍스트 노드)
            const textNodes = xmlDoc.getElementsByTagName("a:t");
            const texts: string[] = [];
            for (let j = 0; j < textNodes.length; j++) {
              const text = textNodes[j].textContent;
              if (text) {
                texts.push(text);
              }
            }

            parsedSlides.push({
              number: i + 1,
              content: texts.join(" "),
            });
          }
        }

        if (abortControllerRef.current?.signal.aborted) return;

        if (parsedSlides.length === 0) {
          throw new Error("슬라이드를 찾을 수 없습니다.");
        }

        setProgressMessage("완료!");
        setProgress(100);

        // 약간의 지연 후 상태 업데이트 (UI 반응성 향상)
        await new Promise(resolve => setTimeout(resolve, 100));

        setSlides(parsedSlides);
        setIsLoading(false);

        console.log("✅ [PowerPoint 뷰어] 파싱 완료", { slideCount: parsedSlides.length });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log("📊 [PowerPoint 뷰어] 파싱 취소됨");
          return;
        }
        console.error("❌ [PowerPoint 뷰어] 오류:", err);
        setError(
          err instanceof Error
            ? err.message
            : "PowerPoint 파일을 파싱하는 중 오류가 발생했습니다."
        );
        setIsLoading(false);
      }
    };

    parsePowerPoint();

    // 클린업
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [file]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

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

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">슬라이드를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="w-full">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToSlide(currentSlide - 1)}
            disabled={currentSlide <= 0}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
              flex items-center gap-1
            "
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            슬라이드 {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => goToSlide(currentSlide + 1)}
            disabled={currentSlide >= slides.length - 1}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
              flex items-center gap-1
            "
          >
            다음
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 슬라이드 썸네일 네비게이션 */}
        {slides.length > 1 && (
          <div className="flex gap-1 overflow-x-auto max-w-full">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`
                  px-2 py-1
                  rounded
                  text-xs
                  whitespace-nowrap
                  transition-colors
                  ${
                    currentSlide === index
                      ? "bg-emerald-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }
                `}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 슬라이드 내용 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 min-h-[400px]">
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            슬라이드 {currentSlideData.number}
          </h3>
        </div>
        <div
          className="
            prose prose-sm sm:prose-base lg:prose-lg
            dark:prose-invert
            max-w-none
            text-gray-900 dark:text-gray-100
          "
        >
          {currentSlideData.content ? (
            <p className="whitespace-pre-wrap">{currentSlideData.content}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">이 슬라이드에는 텍스트가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
