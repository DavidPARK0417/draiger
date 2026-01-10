"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle, Download, FileText, Info } from "lucide-react";
import PDFViewer from "./PDFViewer";

interface HWPViewerProps {
  file: File;
}

export default function HWPViewer({ file }: HWPViewerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const [useServerConversion, setUseServerConversion] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 이미 변환이 완료된 경우 재실행 방지
    if (useServerConversion && pdfUrl) {
      console.log("📄 [HWP 뷰어] 이미 변환 완료, 재실행 건너뜀");
      return;
    }

    const convertHWP = async () => {
      // 이전 작업 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);

        console.log("📄 [HWP 뷰어] 서버 사이드 변환 시작", {
          fileName: file.name,
          fileSize: file.size,
        });

        // 근본적인 해결: 클라이언트 파싱을 건너뛰고 바로 서버 사이드 변환 시도
        setProgressMessage("서버에서 변환 중...");
        setProgress(20);

        // 근본적인 해결: 클라이언트 파싱을 건너뛰고 바로 서버 사이드 변환 시도
        // HWP 파일은 복잡한 OLE 형식이라 브라우저에서 정확한 파싱이 불가능
        // 서버 사이드 변환이 가장 정확한 방법
        
        try {
          const formData = new FormData();
          formData.append("file", file);

          setProgressMessage("서버에서 HWP 파일 변환 중...");
          setProgress(40);

          // 타임아웃 설정 (60초)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const response = await fetch("/api/convert-hwp", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log("📥 [HWP 뷰어] 서버 응답 수신", {
            ok: response.ok,
            status: response.status,
            contentType: response.headers.get("content-type"),
            contentLength: response.headers.get("content-length"),
          });

          if (response.ok) {
            setProgressMessage("PDF 파일 다운로드 중...");
            setProgress(60);
            
            // Blob 읽기 (진행률 추적)
            console.log("📥 [HWP 뷰어] Blob 읽기 시작");
            
            try {
              const blob = await response.blob();
              console.log("📥 [HWP 뷰어] Blob 읽기 완료", { size: blob.size });
              
              if (blob.size === 0) {
                throw new Error("PDF 파일이 비어있습니다.");
              }
              
              setProgressMessage("PDF 준비 중...");
              setProgress(80);
              
              // Blob URL을 사용 (PDF.js가 blob URL을 잘 지원함)
              // ArrayBuffer는 detached 문제가 발생할 수 있으므로 blob URL 사용
              const url = URL.createObjectURL(blob);
              
              console.log("📥 [HWP 뷰어] Blob URL 생성 완료", {
                blobSize: blob.size,
                url: url.substring(0, 50) + "...",
              });
              
              setPdfUrl(url);
              setUseServerConversion(true);
              setProgressMessage("완료!");
              setProgress(100);
              
              // 약간의 지연 후 로딩 완료 (UI 반응성)
              await new Promise(resolve => setTimeout(resolve, 200));
              
              setIsLoading(false);
              console.log("✅ [HWP 뷰어] 서버 사이드 변환 성공", {
                blobSize: blob.size,
              });
              return; // PDF 뷰어로 전환
            } catch (blobError) {
              console.error("❌ [HWP 뷰어] Blob 읽기 오류:", blobError);
              throw new Error("PDF 파일을 읽는 중 오류가 발생했습니다.");
            }
          } else {
            const errorData = await response.json();
            console.warn("서버 변환 실패:", errorData);
            
            // 서버 변환 실패 시 명확한 에러 메시지
            if (errorData.requiresPython) {
              setError(
                "서버 사이드 변환을 사용하려면 Python이 필요합니다. " +
                "현재는 HWP 파일을 직접 미리보기할 수 없습니다. " +
                "파일을 다운로드하여 한글과컴퓨터 한글 뷰어로 확인해주세요."
              );
            } else {
              setError(
                errorData.error || 
                "HWP 파일 변환에 실패했습니다. 파일을 다운로드하여 한글 뷰어로 확인해주세요."
              );
            }
            setIsLoading(false);
            return;
          }
        } catch (serverError) {
          console.error("서버 변환 오류:", serverError);
          
          let errorMessage = "서버 변환 중 오류가 발생했습니다.";
          if (serverError instanceof Error) {
            if (serverError.name === 'AbortError') {
              errorMessage = "변환 시간이 초과되었습니다. 파일이 너무 크거나 복잡할 수 있습니다.";
            } else {
              errorMessage = serverError.message || errorMessage;
            }
          }
          
          setError(
            errorMessage + " " +
            "파일을 다운로드하여 한글과컴퓨터 한글 뷰어로 확인해주세요."
          );
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("❌ [HWP 뷰어] 오류:", err);
        setError(
          err instanceof Error
            ? err.message
            : "HWP 파일을 읽는 중 오류가 발생했습니다."
        );
        setIsLoading(false);
      }
    };

    convertHWP();

    // 클린업
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // pdfUrl은 컴포넌트 언마운트 시에만 정리
    };
  }, [file]); // pdfUrl을 의존성에서 제거하여 무한 루프 방지

  // 컴포넌트 언마운트 시 blob URL 정리
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]); // pdfUrl이 변경될 때마다 이전 URL 정리

  // 파일 다운로드 핸들러
  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center w-full max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {progressMessage}
          </p>

          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center w-full max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleDownload}
            className="
              mt-4
              px-4 py-2.5
              bg-emerald-500 hover:bg-emerald-600
              dark:bg-emerald-600 dark:hover:bg-emerald-500
              text-white
              rounded-xl
              transition-all duration-300
              flex items-center gap-2 mx-auto
            "
          >
            <Download size={18} />
            파일 다운로드
          </button>
        </div>
      </div>
    );
  }

  // 서버 변환 성공 시 PDF 뷰어 표시
  if (useServerConversion && pdfUrl) {
    return (
      <div className="w-full">
        <div
          className="
            mb-4
            p-4
            bg-emerald-50 dark:bg-emerald-900/20
            border border-emerald-200 dark:border-emerald-800
            rounded-lg
            flex items-start gap-3
          "
        >
          <Info className="w-5 h-5 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              HWP 파일 미리보기 안내
            </p>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
              이 파일은 서버에서 PDF로 변환하여 표시됩니다. HWP 파일은 복잡한 바이너리 형식으로 인해 
              브라우저에서 완벽한 미리보기가 어렵습니다. 변환된 PDF는 기본적인 텍스트와 구조만 표시되며, 
              원본의 정확한 레이아웃, 이미지, 표, 서식 등이 완전히 보존되지 않을 수 있습니다.
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
              💡 완전한 내용을 확인하려면 파일을 다운로드하여 한글과컴퓨터 한글 뷰어로 열어주세요.
            </p>
          </div>
        </div>
        <PDFViewer url={pdfUrl} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 안내 메시지 */}
      <div
        className="
          mb-6
          p-4
          bg-blue-50 dark:bg-blue-900/20
          border border-blue-200 dark:border-blue-800
          rounded-xl
          flex items-start gap-3
        "
      >
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            HWP 파일 미리보기 제한사항
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            HWP 파일은 복잡한 형식으로 인해 브라우저에서 완전한 미리보기가 어렵습니다.
            현재는 기본적인 텍스트만 추출하여 표시합니다. 완전한 내용을 보려면
            한글과컴퓨터 한글 뷰어를 사용하시거나, 파일을 다운로드하여 확인해주세요.
          </p>
        </div>
      </div>

      {/* 에러 메시지 또는 안내 */}
      {error ? (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} />
              텍스트 추출 불가
            </h3>
            <button
              onClick={handleDownload}
              className="
                px-4 py-2.5
                text-sm
                bg-emerald-500 hover:bg-emerald-600
                dark:bg-emerald-600 dark:hover:bg-emerald-500
                text-white
                rounded-xl
                transition-all duration-300
                flex items-center gap-2
                shadow-md hover:shadow-lg
              "
            >
              <Download size={18} />
              파일 다운로드
            </button>
          </div>
          <div
            className="
              w-full
              p-6 sm:p-8
              bg-white dark:bg-gray-800
              border-2 border-dashed
              border-gray-300 dark:border-gray-600
              rounded-lg
              text-center
            "
          >
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              텍스트를 추출할 수 없습니다
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              HWP 파일은 복잡한 바이너리 형식으로 인해 브라우저에서 완전한 파싱이 어렵습니다.
            </p>
            <div className="text-left bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mt-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                📋 해결 방법:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>파일을 다운로드하여 한글과컴퓨터 한글 뷰어로 열기</li>
                <li>한글과컴퓨터 공식 변환 도구로 PDF로 변환 후 미리보기</li>
                <li>온라인 변환 서비스를 사용하여 다른 형식으로 변환</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} />
              파일 정보
            </h3>
            <button
              onClick={handleDownload}
              className="
                px-4 py-2.5
                text-sm
                bg-emerald-500 hover:bg-emerald-600
                dark:bg-emerald-600 dark:hover:bg-emerald-500
                text-white
                rounded-xl
                transition-all duration-300
                flex items-center gap-2
                shadow-md hover:shadow-lg
              "
            >
              <Download size={18} />
              파일 다운로드
            </button>
          </div>
          <div
            className="
              w-full
              p-6 sm:p-8
              bg-white dark:bg-gray-800
              border-2 border-dashed
              border-gray-300 dark:border-gray-600
              rounded-lg
              text-center
            "
          >
            <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              서버 변환 대기 중
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              HWP 파일은 서버에서 변환하여 표시합니다.
            </p>
          </div>
        </div>
      )}

      {/* 추가 안내 */}
      <div
        className="
          mt-4
          p-4
          bg-gray-50 dark:bg-gray-800/50
          border border-gray-200 dark:border-gray-700
          rounded-lg
        "
      >
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          💡 <strong>팁:</strong> HWP 파일을 완전히 보려면 다음 방법을 사용하세요:
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside ml-2">
          <li>한글과컴퓨터 한글 뷰어 설치 후 파일 다운로드</li>
          <li>한글과컴퓨터 공식 변환 도구로 PDF 변환</li>
          <li>온라인 변환 서비스 활용</li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          참고: 서버에 Python이 설치되어 있으면 자동으로 PDF 변환을 시도합니다.
        </p>
      </div>
    </div>
  );
}

