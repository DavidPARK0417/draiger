"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface PDFViewerProps {
  url: string;
}

// pdfjs-dist 타입 - 동적 import이므로 unknown 사용 후 타입 단언
// 실제 타입은 pdfjs-dist의 PDFDocumentProxy, PDFPageProxy, RenderTask
type PDFDocumentProxy = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<unknown>;
};

type PDFPageProxy = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (context: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => {
    promise: Promise<void>;
    cancel: () => void;
  };
};

type PDFRenderTask = {
  promise: Promise<void>;
  cancel: () => void;
};

export default function PDFViewer({ url }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("PDF 로드 중...");
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<PDFRenderTask | null>(null); // 현재 렌더링 작업 추적
  const isRenderingRef = useRef<boolean>(false); // 렌더링 중인지 추적

  useEffect(() => {
    if (!url) return;

    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        setProgressMessage("PDF 라이브러리 로드 중...");
        setProgress(10);

        // 클라이언트에서만 동적으로 pdfjs-dist 로드
        const pdfjsLib = await import("pdfjs-dist");
        
        setProgressMessage("워커 설정 중...");
        setProgress(20);
        
        // PDF.js 워커 설정 - 로컬 워커 파일 사용 (public 폴더에 복사됨)
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        console.log("📄 [PDF 뷰어] 워커 설정 완료", {
          version: pdfjsLib.version,
          workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc,
        });

        setProgressMessage("PDF 파일 로드 중...");
        setProgress(30);

        const loadingTask = pdfjsLib.getDocument(url);
        
        // 로딩 진행률 추적
        loadingTask.onProgress = (progressData: { loaded: number; total: number }) => {
          if (progressData.total) {
            const percent = (progressData.loaded / progressData.total) * 50 + 30; // 30-80%
            setProgress(Math.min(80, percent));
          }
        };

        const pdf = await loadingTask.promise;
        pdfRef.current = pdf as PDFDocumentProxy;
        setTotalPages(pdf.numPages);

        console.log("✅ [PDF 뷰어] PDF 로드 완료", {
          totalPages: pdf.numPages,
        });

        setProgressMessage("페이지 렌더링 중...");
        setProgress(90);

        // 초기 페이지 렌더링은 useEffect에서 처리
        // 여기서는 PDF만 로드하고 상태만 업데이트
        
        setProgressMessage("완료!");
        setProgress(100);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ [PDF 뷰어] 오류:", err);
        setError("PDF를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [url]);

  const renderPage = useCallback(async (pdf: PDFDocumentProxy, pageNum: number) => {
    if (!canvasRef.current) return;

    // 이미 렌더링 중이면 이전 작업 취소
    if (isRenderingRef.current && renderTaskRef.current) {
      try {
        console.log("🔄 [PDF 뷰어] 이전 렌더링 작업 취소 중...");
        renderTaskRef.current.cancel();
      } catch {
        // 취소 중 오류는 무시 (이미 완료된 경우)
      }
      renderTaskRef.current = null;
    }

    // 렌더링 시작
    isRenderingRef.current = true;

    try {
      // pdfjs-dist가 이미 로드되어 있다고 가정 (loadPDF에서 로드됨)
      const page = (await pdf.getPage(pageNum)) as PDFPageProxy;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas context를 가져올 수 없습니다.");
      }

      // 캔버스 크기 설정
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // 캔버스 초기화 (이전 렌더링 잔여물 제거)
      context.clearRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // 렌더링 작업 시작 및 추적
      const renderTask = page.render(renderContext) as PDFRenderTask;
      renderTaskRef.current = renderTask;

      console.log("📄 [PDF 뷰어] 페이지 렌더링 시작", {
        page: pageNum,
        scale: scale,
      });

      await renderTask.promise;

      console.log("✅ [PDF 뷰어] 페이지 렌더링 완료", {
        page: pageNum,
      });
    } catch (err: unknown) {
      // 취소된 작업은 오류로 처리하지 않음
      if (err && typeof err === 'object' && 'name' in err && err.name === "RenderingCancelledException") {
        console.log("ℹ️ [PDF 뷰어] 렌더링 작업이 취소되었습니다.");
        return;
      }
      console.error("❌ [PDF 뷰어] 페이지 렌더링 오류:", err);
    } finally {
      // 렌더링 완료
      isRenderingRef.current = false;
      renderTaskRef.current = null;
    }
  }, [scale]);

  useEffect(() => {
    if (pdfRef.current && !isLoading && totalPages > 0) {
      renderPage(pdfRef.current, currentPage);
    }
  }, [currentPage, isLoading, renderPage, totalPages]);

  // 컴포넌트 언마운트 시 렌더링 작업 취소
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // 취소 중 오류는 무시
        }
        renderTaskRef.current = null;
      }
      isRenderingRef.current = false;
    };
  }, []);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <div className="w-full">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
            "
          >
            이전
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
            "
          >
            다음
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
            "
          >
            -
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-200 w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="
              px-3 py-1.5
              bg-white dark:bg-gray-700
              text-gray-700 dark:text-gray-200
              rounded-lg
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-colors
              text-sm
            "
          >
            +
          </button>
        </div>
      </div>

      {/* PDF 캔버스 */}
      <div className="w-full overflow-auto bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
        {isLoading && (
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
        )}
        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        {!isLoading && !error && (
          <canvas
            ref={canvasRef}
            className="mx-auto shadow-lg bg-white dark:bg-gray-900"
          />
        )}
      </div>
    </div>
  );
}

