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
          // 이미지 품질 향상을 위한 안티앨리어싱 설정
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, size, size);
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

  // ICO 파일 생성 (간단한 버전 - 32x32 PNG를 기반으로 생성)
  const createIcoFile = useCallback(
    async (file: File): Promise<Blob> => {
      // 실제 ICO는 멀티 레이어 형식이지만, 브라우저에서는 제한적
      // 여기서는 32x32 PNG를 반환 (대부분의 브라우저에서 작동)
      // 실제 프로덕션에서는 서버에서 ICO 생성 라이브러리 사용 권장
      return resizeImage(file, 32);
    },
    [resizeImage]
  );

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
<link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="manifest" href="/site.webmanifest">`;

      zip.file("install-instructions.txt", htmlLinks);

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `favicon-package-${Date.now()}.zip`;
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
        </Card>
      </div>
    </div>
  );
}
