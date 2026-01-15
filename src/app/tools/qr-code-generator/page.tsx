"use client";

import { useState, useCallback } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("256");
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  // QR코드 생성 (간단한 API 사용)
  const generateQRCode = useCallback(() => {
    if (text.trim() === "") {
      alert("텍스트를 입력해주세요.");
      return;
    }

    // QR코드 생성 API 사용 (예: qr-server.com)
    const encodedText = encodeURIComponent(text);
    const qrSize = parseInt(size);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}`;

    setQrCodeUrl(qrUrl);
    console.log("✅ [QR코드 생성] QR코드 생성 완료", { text, size: qrSize });
  }, [text, size]);

  // QR코드 이미지 다운로드
  const handleDownload = useCallback(() => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("✅ [QR코드 생성] QR코드 다운로드 완료");
  }, [qrCodeUrl]);

  // QR코드 URL 복사
  const handleCopyUrl = useCallback(() => {
    if (!qrCodeUrl) return;

    navigator.clipboard
      .writeText(qrCodeUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        console.log("✅ [QR코드 생성] QR코드 URL 복사 완료");
      })
      .catch((error) => {
        console.error("❌ [QR코드 생성] URL 복사 실패:", error);
      });
  }, [qrCodeUrl]);

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
            QR코드 생성기
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            텍스트, URL, 연락처 정보 등을 QR코드로 변환할 수 있습니다. 다양한
            크기 옵션을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 왼쪽: 입력 영역 */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                QR코드 정보 입력
              </h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label="텍스트 또는 URL"
                    type="text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setQrCodeUrl(""); // 텍스트 변경 시 QR코드 초기화
                    }}
                    placeholder="https://example.com 또는 텍스트 입력"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    URL, 텍스트, 연락처 정보 등을 입력할 수 있습니다.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    QR코드 크기
                  </label>
                  <Select
                    value={size}
                    onChange={(e) => {
                      setSize(e.target.value);
                      setQrCodeUrl(""); // 크기 변경 시 QR코드 초기화
                    }}
                  >
                    <option value="128">128x128 (작음)</option>
                    <option value="256">256x256 (보통)</option>
                    <option value="512">512x512 (큼)</option>
                    <option value="1024">1024x1024 (매우 큼)</option>
                  </Select>
                </div>
                <Button
                  fullWidth
                  onClick={generateQRCode}
                  disabled={text.trim() === ""}
                >
                  QR코드 생성
                </Button>
              </div>
            </Card>
          </div>

          {/* 오른쪽: QR코드 미리보기 */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                QR코드 미리보기
              </h2>
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {qrCodeUrl ? (
                  <div className="space-y-4 w-full">
                    <div className="flex justify-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="max-w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                      <Button
                        fullWidth
                        variant="secondary"
                        onClick={handleCopyUrl}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            복사됨
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            URL 복사
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      텍스트를 입력하고 QR코드를 생성해주세요.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
