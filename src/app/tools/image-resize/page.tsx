"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Download as DownloadIcon,
  FileDown,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

type ResizeMode = "pixel" | "percent";
type ResizeOption = "max" | "exact";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  processedUrl?: string;
  isProcessing: boolean;
  error?: string;
}

const SIZE_PRESETS = [
  { value: "custom", label: "직접 입력", width: "", height: "" },
  {
    value: "1920x1080",
    label: "1920x1080 (Full HD)",
    width: "1920",
    height: "1080",
  },
  { value: "1280x720", label: "1280x720 (HD)", width: "1280", height: "720" },
  {
    value: "1080x1080",
    label: "1080x1080 (정사각형)",
    width: "1080",
    height: "1080",
  },
  {
    value: "1080x1920",
    label: "1080x1920 (세로형)",
    width: "1080",
    height: "1920",
  },
  {
    value: "720x1280",
    label: "720x1280 (세로형)",
    width: "720",
    height: "1280",
  },
  { value: "854x480", label: "854x480 (SD)", width: "854", height: "480" },
  {
    value: "3840x2160",
    label: "3840x2160 (4K)",
    width: "3840",
    height: "2160",
  },
] as const;

export default function ImageResizePage() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("pixel");
  const [resizeOption, setResizeOption] = useState<ResizeOption>("exact");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [percent, setPercent] = useState<string>("100");
  const [maintainAspectRatio, setMaintainAspectRatio] =
    useState<boolean>(false);
  const [dontEnlarge, setDontEnlarge] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 처리
  const handleFilesSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newImageFiles: ImageFile[] = [];

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        console.warn(
          `⚠️ [이미지 업로드] 이미지가 아닌 파일 제외: ${file.name}`
        );
        return;
      }

      const id = `${Date.now()}-${Math.random()}`;
      const reader = new FileReader();

      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setImageFiles((prev) => {
          const existing = prev.find((img) => img.id === id);
          if (existing) {
            return prev.map((img) =>
              img.id === id ? { ...img, preview } : img
            );
          }
          return [...prev, { id, file, preview, isProcessing: false }];
        });
      };

      reader.readAsDataURL(file);
      newImageFiles.push({
        id,
        file,
        preview: "",
        isProcessing: false,
      });
    });

    if (newImageFiles.length === 0 && fileArray.length > 0) {
      alert("이미지 파일만 업로드할 수 있습니다.");
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
        handleFilesSelect(files);
      }
    },
    [handleFilesSelect]
  );

  // 단일 이미지 리사이즈 처리
  const handleResizeSingle = useCallback(
    async (imageFile: ImageFile) => {
      // 처리 상태 업데이트
      setImageFiles((prev) =>
        prev.map((img) =>
          img.id === imageFile.id
            ? { ...img, isProcessing: true, error: undefined }
            : img
        )
      );

      try {
        const formData = new FormData();
        formData.append("image", imageFile.file);
        formData.append("mode", resizeMode);
        formData.append("option", resizeOption);
        formData.append("maintainAspectRatio", maintainAspectRatio.toString());

        if (resizeMode === "pixel") {
          if (!width && !height) {
            throw new Error("너비 또는 높이를 입력해주세요.");
          }
          formData.append("width", width || "0");
          formData.append("height", height || "0");
          formData.append("dontEnlarge", dontEnlarge.toString());
        } else {
          if (!percent || parseFloat(percent) <= 0) {
            throw new Error("올바른 퍼센트 값을 입력해주세요.");
          }
          formData.append("percent", percent);
        }

        console.log("🖼️ [이미지 리사이즈] 요청 시작", {
          id: imageFile.id,
          fileName: imageFile.file.name,
          mode: resizeMode,
        });

        const response = await fetch("/api/resize", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "이미지 처리 중 오류가 발생했습니다.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // 처리 완료 상태 업데이트
        setImageFiles((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, processedUrl: url, isProcessing: false }
              : img
          )
        );

        console.log("✅ [이미지 리사이즈] 완료", { id: imageFile.id });
      } catch (error) {
        console.error("❌ [이미지 리사이즈] 오류:", error);
        setImageFiles((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? {
                  ...img,
                  isProcessing: false,
                  error:
                    error instanceof Error
                      ? error.message
                      : "처리 중 오류 발생",
                }
              : img
          )
        );
      }
    },
    [
      resizeMode,
      resizeOption,
      width,
      height,
      percent,
      maintainAspectRatio,
      dontEnlarge,
    ]
  );

  // 모든 이미지 일괄 처리
  const handleResizeAll = useCallback(async () => {
    if (imageFiles.length === 0) {
      alert("이미지를 먼저 업로드해주세요.");
      return;
    }

    if (resizeMode === "pixel" && !width && !height) {
      alert("너비 또는 높이를 입력해주세요.");
      return;
    }

    if (resizeMode === "percent" && (!percent || parseFloat(percent) <= 0)) {
      alert("올바른 퍼센트 값을 입력해주세요.");
      return;
    }

    setIsProcessingAll(true);

    // 모든 이미지를 순차적으로 처리
    for (const imageFile of imageFiles) {
      await handleResizeSingle(imageFile);
    }

    setIsProcessingAll(false);
    console.log("✅ [이미지 리사이즈] 모든 이미지 처리 완료");
  }, [imageFiles, handleResizeSingle, resizeMode, width, height, percent]);

  // ZIP 다운로드
  const handleDownloadAll = useCallback(async () => {
    // 처리 완료된 이미지만 필터링
    const processedImages = imageFiles.filter(
      (img) => img.processedUrl && !img.isProcessing && !img.error
    );

    if (processedImages.length === 0) {
      alert("처리된 이미지가 없습니다.");
      return;
    }

    // 처리 중인 이미지가 있는지 확인
    const processingImages = imageFiles.filter((img) => img.isProcessing);
    if (processingImages.length > 0) {
      alert(
        `아직 처리 중인 이미지가 ${processingImages.length}개 있습니다. 모든 이미지 처리가 완료된 후 다시 시도해주세요.`
      );
      return;
    }

    try {
      console.log("📦 [ZIP 다운로드] 시작", { count: processedImages.length });

      // jszip 라이브러리 동적 import
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // 각 이미지를 ZIP에 추가
      for (const imageFile of processedImages) {
        if (!imageFile.processedUrl) continue;

        try {
          const response = await fetch(imageFile.processedUrl);
          if (!response.ok) {
            console.warn(
              `⚠️ [ZIP 다운로드] 이미지 로드 실패: ${imageFile.file.name}`
            );
            continue;
          }
          const blob = await response.blob();
          const fileName = `resized_${imageFile.file.name}`;
          zip.file(fileName, blob);
          console.log(`✅ [ZIP 다운로드] 이미지 추가: ${fileName}`);
        } catch (error) {
          console.error(
            `❌ [ZIP 다운로드] 이미지 추가 오류: ${imageFile.file.name}`,
            error
          );
        }
      }

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resized_images_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("✅ [ZIP 다운로드] 완료", { count: processedImages.length });
    } catch (error) {
      console.error("❌ [ZIP 다운로드] 오류:", error);
      alert("ZIP 다운로드 중 오류가 발생했습니다.");
    }
  }, [imageFiles]);

  // 개별 이미지 다운로드
  const handleDownloadSingle = useCallback((imageFile: ImageFile) => {
    if (!imageFile.processedUrl) return;

    const link = document.createElement("a");
    link.href = imageFile.processedUrl;
    link.download = `resized_${imageFile.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // 이미지 제거
  const handleRemoveImage = useCallback((id: string) => {
    setImageFiles((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed?.processedUrl) {
        URL.revokeObjectURL(removed.processedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  // 프리셋 변경 처리
  const handlePresetChange = useCallback((value: string) => {
    setSelectedPreset(value);
    if (value !== "custom") {
      const preset = SIZE_PRESETS.find((p) => p.value === value);
      if (preset) {
        setWidth(preset.width);
        setHeight(preset.height);
      }
    }
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
            이미지 크기 조정
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            여러 이미지를 한 번에 업로드하고 크기를 조정할 수 있습니다. 픽셀
            또는 퍼센트 단위로 크기를 조정하고 ZIP 파일로 다운로드하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 왼쪽: 업로드 및 옵션 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 업로드 영역 */}
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                이미지 업로드
              </h2>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="
                  border-2 border-dashed
                  border-gray-300 dark:border-gray-600
                  rounded-xl
                  p-8
                  text-center
                  cursor-pointer
                  transition-all duration-300
                  hover:border-emerald-500 dark:hover:border-emerald-400
                  hover:bg-emerald-50 dark:hover:bg-gray-800
                "
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-2">
                  이미지를 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  여러 이미지 동시 업로드 가능
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      handleFilesSelect(e.target.files);
                    }
                  }}
                />
              </div>
            </Card>

            {/* 크기 조정 옵션 */}
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                크기 조정 옵션
              </h2>
              <div className="space-y-4">
                {/* 모드 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    조정 모드
                  </label>
                  <Select
                    value={resizeMode}
                    onChange={(e) =>
                      setResizeMode(e.target.value as ResizeMode)
                    }
                  >
                    <option value="pixel">픽셀 단위</option>
                    <option value="percent">퍼센트 단위</option>
                  </Select>
                </div>

                {/* 픽셀 모드 */}
                {resizeMode === "pixel" && (
                  <>
                    {/* 프리셋 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        크기 프리셋
                      </label>
                      <Select
                        value={selectedPreset}
                        onChange={(e) => handlePresetChange(e.target.value)}
                      >
                        {SIZE_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* 너비/높이 입력 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="너비 (px)"
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          placeholder="자동"
                        />
                      </div>
                      <div>
                        <Input
                          label="높이 (px)"
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="자동"
                        />
                      </div>
                    </div>

                    {/* 옵션 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        크기 옵션
                      </label>
                      <Select
                        value={resizeOption}
                        onChange={(e) =>
                          setResizeOption(e.target.value as ResizeOption)
                        }
                      >
                        <option value="max">최대 크기 (비율 유지)</option>
                        <option value="exact">정확한 크기</option>
                      </Select>
                    </div>
                  </>
                )}

                {/* 퍼센트 모드 */}
                {resizeMode === "percent" && (
                  <div>
                    <Input
                      label="퍼센트 (%)"
                      type="number"
                      value={percent}
                      onChange={(e) => setPercent(e.target.value)}
                      placeholder="100"
                      min="1"
                      step="1"
                    />
                  </div>
                )}

                {/* 체크박스 옵션 */}
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
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
                      가로세로 비율 유지
                    </span>
                  </label>
                  {resizeMode === "pixel" && (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dontEnlarge}
                        onChange={(e) => setDontEnlarge(e.target.checked)}
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
                        원본보다 작을 때만 조정 (확대 안함)
                      </span>
                    </label>
                  )}
                </div>

                {/* 일괄 처리 버튼 */}
                <Button
                  fullWidth
                  onClick={handleResizeAll}
                  disabled={isProcessingAll || imageFiles.length === 0}
                  isLoading={isProcessingAll}
                >
                  {isProcessingAll ? "처리 중..." : "모든 이미지 처리"}
                </Button>

                {/* ZIP 다운로드 버튼 */}
                {(() => {
                  // 처리 완료된 이미지 수
                  const processedCount = imageFiles.filter(
                    (img) => img.processedUrl && !img.isProcessing && !img.error
                  ).length;
                  // 처리 중인 이미지 수
                  const processingCount = imageFiles.filter(
                    (img) => img.isProcessing
                  ).length;
                  // 에러가 발생한 이미지 수
                  const errorCount = imageFiles.filter(
                    (img) => img.error && !img.processedUrl
                  ).length;
                  // 모든 이미지가 처리 완료되었는지 확인
                  const allProcessed =
                    processedCount > 0 &&
                    processingCount === 0 &&
                    imageFiles.length === processedCount + errorCount;

                  if (processedCount === 0) return null;

                  return (
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={handleDownloadAll}
                      disabled={!allProcessed || isProcessingAll}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      {allProcessed
                        ? `모든 이미지 ZIP 다운로드 (${processedCount}개)`
                        : `ZIP 다운로드 (${processedCount}/${
                            imageFiles.length - errorCount
                          }개 완료)`}
                    </Button>
                  );
                })()}
              </div>
            </Card>
          </div>

          {/* 오른쪽: 이미지 목록 */}
          <div className="lg:col-span-2">
            {imageFiles.length === 0 ? (
              <Card padding="lg">
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">
                    업로드된 이미지가 없습니다.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {imageFiles.map((imageFile) => (
                  <Card key={imageFile.id} padding="md">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* 이미지 미리보기 */}
                      <div className="flex-shrink-0">
                        <div className="relative w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {imageFile.preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imageFile.preview}
                              alt={imageFile.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 이미지 정보 및 액션 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                              {imageFile.file.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {(imageFile.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveImage(imageFile.id)}
                            className="
                              flex-shrink-0
                              p-1
                              text-gray-400 hover:text-red-500
                              dark:text-gray-500 dark:hover:text-red-400
                              transition-colors
                            "
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* 상태 표시 */}
                        {imageFile.isProcessing && (
                          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>처리 중...</span>
                          </div>
                        )}

                        {imageFile.error && (
                          <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                            {imageFile.error}
                          </div>
                        )}

                        {imageFile.processedUrl && (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                            <span>✅ 처리 완료</span>
                          </div>
                        )}

                        {/* 액션 버튼 */}
                        <div className="flex gap-2 mt-3">
                          {!imageFile.processedUrl &&
                            !imageFile.isProcessing && (
                              <Button
                                size="sm"
                                onClick={() => handleResizeSingle(imageFile)}
                                disabled={
                                  resizeMode === "pixel" && !width && !height
                                }
                              >
                                처리하기
                              </Button>
                            )}
                          {imageFile.processedUrl && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownloadSingle(imageFile)}
                            >
                              <DownloadIcon className="w-4 h-4 mr-1" />
                              다운로드
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
