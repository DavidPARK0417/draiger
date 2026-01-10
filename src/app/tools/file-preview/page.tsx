"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, File, Loader2, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import PDFViewer from "@/components/file-preview/PDFViewer";
import ImageViewer from "@/components/file-preview/ImageViewer";
import WordViewer from "@/components/file-preview/WordViewer";
import ExcelViewer from "@/components/file-preview/ExcelViewer";
import PowerPointViewer from "@/components/file-preview/PowerPointViewer";
import TextViewer from "@/components/file-preview/TextViewer";
import CodeViewer from "@/components/file-preview/CodeViewer";

type FileType = 
  | "pdf" 
  | "image" 
  | "word" 
  | "excel" 
  | "powerpoint" 
  | "text" 
  | "code" 
  | "hwp" 
  | "unknown";

interface PreviewFile {
  id: string;
  file: File;
  type: FileType;
  previewUrl?: string;
  isProcessing: boolean;
  error?: string;
  convertedPdfUrl?: string; // HWP 변환용
}

// 파일 타입 감지
function detectFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  const type = file.type;

  // PDF
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  // 이미지
  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) {
    return "image";
  }

  // Word
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "word";
  }

  // Excel
  if (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    name.endsWith(".xlsx")
  ) {
    return "excel";
  }

  // PowerPoint
  if (
    type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    name.endsWith(".pptx")
  ) {
    return "powerpoint";
  }

  // HWP
  if (name.endsWith(".hwp")) {
    return "hwp";
  }

  // 텍스트 파일
  if (type === "text/plain" || name.endsWith(".txt") || name.endsWith(".md")) {
    return "text";
  }

  // 코드 파일
  if (
    /\.(js|ts|jsx|tsx|py|java|cpp|c|h|css|html|xml|json|yaml|yml|sh|bash|sql|php|rb|go|rs|swift|kt)$/i.test(name)
  ) {
    return "code";
  }

  return "unknown";
}

export default function FilePreviewPage() {
  const [previewFile, setPreviewFile] = useState<PreviewFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    const fileType = detectFileType(file);
    
    console.log("📄 [파일 미리보기] 파일 선택", {
      fileName: file.name,
      fileType,
      fileSize: file.size,
    });

    // 파일 크기 경고 (선택적)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      const proceed = confirm(
        `큰 파일입니다 (${fileSizeMB.toFixed(2)}MB). 로딩에 시간이 걸릴 수 있습니다. 계속하시겠습니까?`
      );
      if (!proceed) return;
    }

    const id = `${Date.now()}-${Math.random()}`;
    const previewFile: PreviewFile = {
      id,
      file,
      type: fileType,
      isProcessing: false,
    };

    // HWP 파일 처리
    if (fileType === "hwp") {
      previewFile.isProcessing = true;
      setPreviewFile(previewFile);

      try {
        console.log("🔄 [HWP 변환] 시작", { fileName: file.name });

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/convert-hwp", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "HWP 변환 중 오류가 발생했습니다.");
        }

        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);

        setPreviewFile({
          ...previewFile,
          convertedPdfUrl: pdfUrl,
          type: "pdf", // PDF로 변환되었으므로 타입 변경
          isProcessing: false,
        });

        console.log("✅ [HWP 변환] 완료");
      } catch (error) {
        console.error("❌ [HWP 변환] 오류:", error);
        setPreviewFile({
          ...previewFile,
          isProcessing: false,
          error:
            error instanceof Error
              ? error.message
              : "HWP 변환 중 오류가 발생했습니다.",
        });
      }
    } else {
      // 다른 파일 타입은 즉시 미리보기
      const previewUrl = URL.createObjectURL(file);
      setPreviewFile({
        ...previewFile,
        previewUrl,
      });
    }
  }, []);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  // 파일 제거
  const handleRemoveFile = useCallback(() => {
    if (previewFile?.previewUrl) {
      URL.revokeObjectURL(previewFile.previewUrl);
    }
    if (previewFile?.convertedPdfUrl) {
      URL.revokeObjectURL(previewFile.convertedPdfUrl);
    }
    setPreviewFile(null);
  }, [previewFile]);

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            파일 미리보기
          </h1>
          <p
            className="
              text-base sm:text-lg lg:text-xl
              text-gray-600 dark:text-gray-200
              max-w-2xl mx-auto
            "
          >
            PDF, 이미지, Word, Excel, PowerPoint, 텍스트 파일 등을
            브라우저에서 바로 미리보기할 수 있습니다.
          </p>
          <p
            className="
              text-sm sm:text-base
              text-gray-500 dark:text-gray-400
              mt-2
            "
          >
            파일은 서버에 저장되지 않습니다.
          </p>
        </div>

        {/* 업로드 영역 */}
        {!previewFile && (
          <Card padding="lg">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="
                border-2 border-dashed
                border-gray-300 dark:border-gray-600
                rounded-xl
                p-8 sm:p-12
                text-center
                cursor-pointer
                transition-all duration-300
                hover:border-emerald-500 dark:hover:border-emerald-400
                hover:bg-emerald-50 dark:hover:bg-gray-800
              "
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">
                파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PDF, 이미지, Word, Excel, PowerPoint, 텍스트 파일 등 지원
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileSelect(e.target.files);
                  }
                }}
              />
            </div>
          </Card>
        )}

        {/* 미리보기 영역 */}
        {previewFile && (
          <Card padding="md">
            {/* 파일 정보 헤더 */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {previewFile.file.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(previewFile.file.size)} · {previewFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="
                  p-2
                  text-gray-400 hover:text-red-500
                  dark:text-gray-500 dark:hover:text-red-400
                  transition-colors
                  rounded-lg
                  hover:bg-gray-100 dark:hover:bg-gray-800
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 처리 중 */}
            {previewFile.isProcessing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {previewFile.type === "hwp" ? "HWP 파일을 PDF로 변환 중..." : "파일 처리 중..."}
                  </p>
                </div>
              </div>
            )}

            {/* 에러 */}
            {previewFile.error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  {previewFile.error}
                </p>
              </div>
            )}

            {/* 미리보기 */}
            {!previewFile.isProcessing && !previewFile.error && (
              <div className="mt-4">
                {previewFile.type === "pdf" && (
                  <PDFViewer
                    url={previewFile.convertedPdfUrl || previewFile.previewUrl || ""}
                  />
                )}
                {previewFile.type === "image" && previewFile.previewUrl && (
                  <ImageViewer url={previewFile.previewUrl} />
                )}
                {previewFile.type === "word" && previewFile.file && (
                  <WordViewer file={previewFile.file} />
                )}
                {previewFile.type === "excel" && previewFile.file && (
                  <ExcelViewer file={previewFile.file} />
                )}
                {previewFile.type === "powerpoint" && previewFile.file && (
                  <PowerPointViewer file={previewFile.file} />
                )}
                {previewFile.type === "text" && previewFile.file && (
                  <TextViewer file={previewFile.file} />
                )}
                {previewFile.type === "code" && previewFile.file && (
                  <CodeViewer file={previewFile.file} />
                )}
                {previewFile.type === "unknown" && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      지원하지 않는 파일 형식입니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

