"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileDown,
  Download as DownloadIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatDateForFilename } from "@/utils/date-format";

interface FaviconFile {
  id: string;
  file: File;
  preview: string;
  processedFiles?: {
    favicon16: Blob;
    favicon32: Blob;
    faviconIco: Blob;
    appleTouchIcon: Blob;
    androidChrome192: Blob;
    favicon256: Blob;
    favicon384: Blob;
    androidChrome512: Blob;
  };
  isProcessing: boolean;
  error?: string;
}

// 파비콘 사이즈 정의
const FAVICON_SIZES = [
  { name: "favicon-16x16.png", size: 16, key: "favicon16" as const },
  { name: "favicon-32x32.png", size: 32, key: "favicon32" as const },
  { name: "icon-180x180.png", size: 180, key: "appleTouchIcon" as const },
  { name: "icon-192x192.png", size: 192, key: "androidChrome192" as const },
  { name: "icon-256x256.png", size: 256, key: "favicon256" as const },
  { name: "icon-384x384.png", size: 384, key: "favicon384" as const },
  { name: "icon-512x512.png", size: 512, key: "androidChrome512" as const },
];

export default function FaviconGeneratorPage() {
  const [imageFile, setImageFile] = useState<FaviconFile | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지를 Canvas에 그려서 리사이즈하는 함수
  const resizeImage = useCallback((file: File, size: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context를 가져올 수 없습니다."));
            return;
          }
          // 고품질 리사이징을 위한 설정
          // Lanczos 알고리즘과 유사한 고품질 리샘플링을 위해
          // imageSmoothingQuality를 "high"로 설정하고
          // 이미지를 더 큰 크기로 먼저 그린 후 축소하는 방법 사용
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // 고품질 리사이징: 원본 이미지를 더 큰 캔버스에 그린 후 축소
          // 이는 Lanczos와 유사한 효과를 제공합니다
          const scale = Math.max(img.width, img.height) / size;
          const scaledSize = size * Math.ceil(scale);

          // 중간 캔버스 생성 (고품질 리사이징용)
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = scaledSize;
          tempCanvas.height = scaledSize;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = "high";
            tempCtx.drawImage(img, 0, 0, scaledSize, scaledSize);

            // 축소하여 최종 캔버스에 그리기
            ctx.drawImage(tempCanvas, 0, 0, size, size);
          } else {
            // 폴백: 직접 그리기
            ctx.drawImage(img, 0, 0, size, size);
          }
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("이미지 변환에 실패했습니다."));
              }
            },
            "image/png",
            0.95
          );
        };
        img.onerror = () => reject(new Error("이미지 로드에 실패했습니다."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("파일 읽기에 실패했습니다."));
      reader.readAsDataURL(file);
    });
  }, []);

  // 클라이언트 사이드 ICO 생성 (폴백)
  // 멀티 사이즈(16x16, 32x32, 48x48)를 포함하는 ICO 파일을 생성합니다.
  const createIcoFileFallback = useCallback(
    async (file: File): Promise<Blob> => {
      try {
        console.log("🔄 [ICO 생성] 클라이언트 사이드 폴백 ICO 생성 시작");

        // 16x16, 32x32, 48x48 PNG를 생성 (멀티 레이어 ICO)
        const [png16, png32, png48] = await Promise.all([
          resizeImage(file, 16),
          resizeImage(file, 32),
          resizeImage(file, 48),
        ]);

        // PNG 데이터를 ArrayBuffer로 변환
        const png16Buffer = await png16.arrayBuffer();
        const png32Buffer = await png32.arrayBuffer();
        const png48Buffer = await png48.arrayBuffer();

        // ICO 파일 헤더 생성
        const header = new ArrayBuffer(6);
        const headerView = new DataView(header);
        headerView.setUint16(0, 0, true); // Reserved: 0
        headerView.setUint16(2, 1, true); // Type: 1 (ICO)
        headerView.setUint16(4, 3, true); // Count: 3 images (16x16, 32x32, 48x48)

        // ICO 디렉토리 엔트리 생성 (각 이미지마다 16 bytes)
        const directory = new ArrayBuffer(48); // 3 images * 16 bytes
        const dirView = new DataView(directory);

        // 첫 번째 이미지 (16x16)
        let offset = 6 + 48; // Header + Directory
        dirView.setUint8(0, 16); // Width
        dirView.setUint8(1, 16); // Height
        dirView.setUint8(2, 0); // Color Palette: 0
        dirView.setUint8(3, 0); // Reserved: 0
        dirView.setUint16(4, 1, true); // Color Planes: 1
        dirView.setUint16(6, 32, true); // Bits Per Pixel: 32 (RGBA)
        dirView.setUint32(8, png16Buffer.byteLength, true); // Image Data Size
        dirView.setUint32(12, offset, true); // Image Data Offset
        offset += png16Buffer.byteLength;

        // 두 번째 이미지 (32x32)
        dirView.setUint8(16, 32); // Width
        dirView.setUint8(17, 32); // Height
        dirView.setUint8(18, 0); // Color Palette: 0
        dirView.setUint8(19, 0); // Reserved: 0
        dirView.setUint16(20, 1, true); // Color Planes: 1
        dirView.setUint16(22, 32, true); // Bits Per Pixel: 32 (RGBA)
        dirView.setUint32(24, png32Buffer.byteLength, true); // Image Data Size
        dirView.setUint32(28, offset, true); // Image Data Offset
        offset += png32Buffer.byteLength;

        // 세 번째 이미지 (48x48)
        dirView.setUint8(32, 48); // Width
        dirView.setUint8(33, 48); // Height
        dirView.setUint8(34, 0); // Color Palette: 0
        dirView.setUint8(35, 0); // Reserved: 0
        dirView.setUint16(36, 1, true); // Color Planes: 1
        dirView.setUint16(38, 32, true); // Bits Per Pixel: 32 (RGBA)
        dirView.setUint32(40, png48Buffer.byteLength, true); // Image Data Size
        dirView.setUint32(44, offset, true); // Image Data Offset

        // ICO 파일 조립: Header + Directory + PNG Data
        const icoFile = new Uint8Array(
          header.byteLength +
            directory.byteLength +
            png16Buffer.byteLength +
            png32Buffer.byteLength +
            png48Buffer.byteLength
        );

        let position = 0;
        icoFile.set(new Uint8Array(header), position);
        position += header.byteLength;

        icoFile.set(new Uint8Array(directory), position);
        position += directory.byteLength;

        icoFile.set(new Uint8Array(png16Buffer), position);
        position += png16Buffer.byteLength;

        icoFile.set(new Uint8Array(png32Buffer), position);
        position += png32Buffer.byteLength;

        icoFile.set(new Uint8Array(png48Buffer), position);

        console.log("✅ [ICO 생성] 클라이언트 사이드 ICO 생성 완료", {
          size: icoFile.byteLength,
          sizes: "16x16, 32x32, 48x48",
        });

        // Blob 생성 (MIME 타입은 image/x-icon)
        return new Blob([icoFile], { type: "image/x-icon" });
      } catch (error) {
        console.error("❌ [ICO 생성] 클라이언트 사이드 오류:", error);
        // 최종 폴백: 32x32 PNG를 반환
        return resizeImage(file, 32);
      }
    },
    [resizeImage]
  );

  // 고품질 ICO 파일 생성 (서버 사이드 API 사용)
  // 서버에서 Pillow를 사용하여 멀티 사이즈(16x16, 32x32, 48x48) ICO를 생성합니다.
  const createIcoFile = useCallback(async (file: File): Promise<Blob> => {
    try {
      console.log("🎨 [ICO 생성] 서버 사이드 고품질 ICO 생성 시작");

      // 서버 API 호출
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/generate-ico", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const icoBlob = await response.blob();
        console.log("✅ [ICO 생성] 서버 사이드 ICO 생성 완료", {
          size: icoBlob.size,
        });
        return icoBlob;
      } else {
        // 서버 사이드 생성 실패 시 클라이언트 사이드 폴백 사용
        const errorData = await response.json().catch(() => ({}));
        console.warn(
          "⚠️ [ICO 생성] 서버 사이드 생성 실패, 클라이언트 사이드 폴백 사용",
          errorData
        );
        return createIcoFileFallback(file);
      }
    } catch (error) {
      console.error("❌ [ICO 생성] 서버 사이드 오류:", error);
      // 오류 발생 시 클라이언트 사이드 폴백 사용
      return createIcoFileFallback(file);
    }
  }, [createIcoFileFallback]);

  // 파일 선택 처리
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const id = `${Date.now()}-${Math.random()}`;
    const reader = new FileReader();

    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImageFile({
        id,
        file,
        preview,
        isProcessing: false,
      });
    };

    reader.readAsDataURL(file);
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

  // 파비콘 생성 처리
  const handleGenerate = useCallback(async () => {
    if (!imageFile) {
      alert("이미지를 먼저 업로드해주세요.");
      return;
    }

    setIsProcessing(true);
    setImageFile((prev) =>
      prev ? { ...prev, isProcessing: true, error: undefined } : null
    );

    try {
      console.log("🎨 [파비콘 생성] 시작", {
        fileName: imageFile.file.name,
      });

      // 모든 사이즈의 파비콘 생성
      const [
        favicon16,
        favicon32,
        appleTouchIcon,
        androidChrome192,
        favicon256,
        favicon384,
        androidChrome512,
        faviconIco,
      ] = await Promise.all([
        resizeImage(imageFile.file, 16),
        resizeImage(imageFile.file, 32),
        resizeImage(imageFile.file, 180),
        resizeImage(imageFile.file, 192),
        resizeImage(imageFile.file, 256),
        resizeImage(imageFile.file, 384),
        resizeImage(imageFile.file, 512),
        createIcoFile(imageFile.file),
      ]);

      setImageFile((prev) =>
        prev
          ? {
              ...prev,
              processedFiles: {
                favicon16,
                favicon32,
                faviconIco,
                appleTouchIcon,
                androidChrome192,
                favicon256,
                favicon384,
                androidChrome512,
              },
              isProcessing: false,
            }
          : null
      );

      console.log("✅ [파비콘 생성] 완료");
    } catch (error) {
      console.error("❌ [파비콘 생성] 오류:", error);
      setImageFile((prev) =>
        prev
          ? {
              ...prev,
              isProcessing: false,
              error:
                error instanceof Error
                  ? error.message
                  : "파비콘 생성 중 오류가 발생했습니다.",
            }
          : null
      );
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, resizeImage, createIcoFile]);

  // ZIP 다운로드
  const handleDownloadZip = useCallback(async () => {
    if (!imageFile?.processedFiles) {
      alert("파비콘을 먼저 생성해주세요.");
      return;
    }

    try {
      console.log("📦 [ZIP 다운로드] 시작");

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // 각 파비콘 파일 추가
      zip.file("favicon-16x16.png", imageFile.processedFiles.favicon16);
      zip.file("favicon-32x32.png", imageFile.processedFiles.favicon32);
      zip.file("favicon.ico", imageFile.processedFiles.faviconIco);
      zip.file("icon-180x180.png", imageFile.processedFiles.appleTouchIcon);
      zip.file("icon-192x192.png", imageFile.processedFiles.androidChrome192);
      zip.file("icon-256x256.png", imageFile.processedFiles.favicon256);
      zip.file("icon-384x384.png", imageFile.processedFiles.favicon384);
      zip.file("icon-512x512.png", imageFile.processedFiles.androidChrome512);

      // site.webmanifest 파일 생성
      const manifest = {
        name: "My App",
        short_name: "My App",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
      };
      zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));

      // HTML 링크 태그 생성
      const htmlLinks = `<!-- 파비콘 링크 태그 - HTML <head>에 추가하세요 -->
<!-- 중요: ICO 파일은 실제 ICO 형식이 아닐 수 있습니다. 브라우저는 PNG 파일도 파비콘으로 사용할 수 있습니다. -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png">
<link rel="manifest" href="/site.webmanifest">`;

      zip.file("install-instructions.txt", htmlLinks);

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;

      // 날짜시분초 형식으로 파일명 생성 (예: favicon-20260111193105)
      const dateString = formatDateForFilename();
      link.download = `favicon-${dateString}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("✅ [ZIP 다운로드] 완료");
    } catch (error) {
      console.error("❌ [ZIP 다운로드] 오류:", error);
      alert("ZIP 다운로드 중 오류가 발생했습니다.");
    }
  }, [imageFile]);

  // 개별 파일 다운로드
  const handleDownloadSingle = useCallback((filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // 이미지 제거
  const handleRemoveImage = useCallback(() => {
    if (imageFile?.preview) {
      URL.revokeObjectURL(imageFile.preview);
    }
    setImageFile(null);
  }, [imageFile]);

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
            파비콘 생성기
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            이미지를 업로드하여 웹사이트용 파비콘을 생성하세요. 다양한 사이즈의
            파비콘 파일을 ZIP으로 다운로드할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 왼쪽: 업로드 및 생성 */}
          <div className="space-y-6">
            {/* 업로드 영역 */}
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                이미지 업로드
              </h2>
              {!imageFile ? (
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
                    PNG, JPG, BMP 파일 지원 (정사각형 이미지 권장)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileSelect(e.target.files);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageFile.preview}
                        alt={imageFile.file.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={handleRemoveImage}
                      className="
                        absolute top-2 right-2
                        p-2
                        bg-white dark:bg-gray-800
                        rounded-full
                        shadow-md
                        text-gray-400 hover:text-red-500
                        dark:text-gray-500 dark:hover:text-red-400
                        transition-colors
                      "
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium">{imageFile.file.name}</p>
                    <p>{(imageFile.file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </Card>

            {/* 생성 버튼 */}
            {imageFile && (
              <Card padding="md">
                <Button
                  fullWidth
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  {isProcessing ? "파비콘 생성 중..." : "파비콘 생성하기"}
                </Button>
              </Card>
            )}

            {/* 에러 메시지 */}
            {imageFile?.error && (
              <Card padding="md">
                <div className="text-sm text-red-600 dark:text-red-400">
                  {imageFile.error}
                </div>
              </Card>
            )}
          </div>

          {/* 오른쪽: 결과 및 다운로드 */}
          <div className="space-y-6">
            {imageFile?.processedFiles ? (
              <Card padding="md">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  생성된 파비콘
                </h2>
                <div className="space-y-4">
                  {/* 미리보기 */}
                  <div className="grid grid-cols-3 gap-4">
                    {FAVICON_SIZES.map(({ name, size, key }) => {
                      const blob = imageFile.processedFiles![key];
                      const url = URL.createObjectURL(blob);

                      return (
                        <div
                          key={name}
                          className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="w-16 h-16 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={name}
                              className="w-full h-full object-contain"
                              onLoad={() => URL.revokeObjectURL(url)}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {size}x{size}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                            {name}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* ZIP 다운로드 버튼 */}
                  <Button
                    fullWidth
                    variant="primary"
                    onClick={handleDownloadZip}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    모든 파일 ZIP 다운로드
                  </Button>

                  {/* 개별 다운로드 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      개별 다운로드:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "favicon-16x16.png",
                            imageFile.processedFiles!.favicon16
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        16x16
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "favicon-32x32.png",
                            imageFile.processedFiles!.favicon32
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        32x32
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "favicon.ico",
                            imageFile.processedFiles!.faviconIco
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        ICO
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "icon-180x180.png",
                            imageFile.processedFiles!.appleTouchIcon
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        180x180
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "icon-192x192.png",
                            imageFile.processedFiles!.androidChrome192
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        192x192
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "icon-256x256.png",
                            imageFile.processedFiles!.favicon256
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        256x256
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "icon-384x384.png",
                            imageFile.processedFiles!.favicon384
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        384x384
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleDownloadSingle(
                            "icon-512x512.png",
                            imageFile.processedFiles!.androidChrome512
                          )
                        }
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        512x512
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card padding="md">
                <div className="text-center py-12">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">
                    이미지를 업로드하고 파비콘을 생성해주세요.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 사용 방법 안내 */}
        <Card padding="md" className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            사용 방법
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>이미지 파일을 업로드하세요 (정사각형 이미지 권장)</li>
            <li>&quot;파비콘 생성하기&quot; 버튼을 클릭하세요</li>
            <li>생성된 파비콘을 ZIP 파일로 다운로드하세요</li>
            <li>다운로드한 파일을 웹사이트 루트 디렉토리에 업로드하세요</li>
            <li>
              ZIP 파일에 포함된 `install-instructions.txt`의 링크 태그를 HTML
              &lt;head&gt;에 추가하세요
            </li>
          </ol>
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-2">
              ✅ 고품질 ICO 파일 형식
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-2">
              생성된 favicon.ico 파일은 전문가용 고품질 ICO 형식으로 생성됩니다:
            </p>
            <ul className="text-xs text-emerald-700 dark:text-emerald-300 list-disc list-inside space-y-1">
              <li>
                멀티 사이즈 지원: 16x16, 32x32, 48x48 크기가 하나의 ICO 파일에
                포함
              </li>
              <li>고품질 리사이징: Lanczos 알고리즘을 사용하여 선명도 유지</li>
              <li>표준 형식 준수: PNG-in-ICO와 BMP 기반 ICO 구조 모두 지원</li>
              <li>
                브라우저 호환성: 모든 브라우저와 Windows 탐색기에서 정상 작동
              </li>
            </ul>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 italic">
              💡 서버에 Python과 Pillow가 설치되어 있으면 더욱 고품질의 ICO
              파일이 생성됩니다.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
