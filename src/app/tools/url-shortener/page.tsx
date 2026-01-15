"use client";

import { useState, useCallback } from "react";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function UrlShortenerPage() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // URL 유효성 검사
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  // URL 단축 함수
  const shortenUrl = useCallback(async () => {
    // 입력값 검증
    if (!longUrl.trim()) {
      setError("URL을 입력해주세요.");
      return;
    }

    // URL 형식 검증
    let urlToShorten = longUrl.trim();
    
    // http:// 또는 https://가 없으면 추가
    if (!urlToShorten.startsWith("http://") && !urlToShorten.startsWith("https://")) {
      urlToShorten = `https://${urlToShorten}`;
    }

    if (!isValidUrl(urlToShorten)) {
      setError("올바른 URL 형식을 입력해주세요. (예: https://example.com)");
      return;
    }

    setIsLoading(true);
    setError("");
    setShortUrl("");

    try {
      // is.gd API 호출 (프리뷰 없이 바로 리다이렉트)
      // 여러 서비스를 시도하는 fallback 방식
      const apis = [
        {
          name: "is.gd",
          url: `https://is.gd/create.php?format=json&url=${encodeURIComponent(urlToShorten)}`,
          parseResponse: async (response: Response) => {
            const data = await response.json();
            if (data.shorturl) {
              return data.shorturl;
            }
            throw new Error("URL 단축에 실패했습니다.");
          },
        },
        {
          name: "v.gd",
          url: `https://v.gd/create.php?format=json&url=${encodeURIComponent(urlToShorten)}`,
          parseResponse: async (response: Response) => {
            const data = await response.json();
            if (data.shorturl) {
              return data.shorturl;
            }
            throw new Error("URL 단축에 실패했습니다.");
          },
        },
        {
          name: "shrtco.de",
          url: `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(urlToShorten)}`,
          parseResponse: async (response: Response) => {
            const data = await response.json();
            if (data.ok && data.result?.full_short_link) {
              return data.result.full_short_link;
            }
            throw new Error("URL 단축에 실패했습니다.");
          },
        },
      ];

      let shortened = "";
      let lastError: Error | null = null;

      // 각 API를 순차적으로 시도
      for (const api of apis) {
        try {
          const response = await fetch(api.url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          shortened = await api.parseResponse(response);
          console.log(`✅ [URL 단축] ${api.name} API로 URL 단축 완료`, {
            original: urlToShorten,
            shortened,
          });
          break; // 성공하면 루프 종료
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          console.warn(`⚠️ [URL 단축] ${api.name} API 실패, 다음 시도...`);
          continue; // 다음 API 시도
        }
      }

      if (!shortened) {
        throw lastError || new Error("모든 URL 단축 서비스에 실패했습니다.");
      }

      setShortUrl(shortened);
    } catch (err) {
      console.error("❌ [URL 단축] 오류 발생:", err);
      setError(
        err instanceof Error
          ? err.message
          : "URL 단축 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  }, [longUrl]);

  // URL 복사 함수
  const handleCopyUrl = useCallback(() => {
    if (!shortUrl) return;

    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        console.log("✅ [URL 단축] URL 복사 완료");
      })
      .catch((error) => {
        console.error("❌ [URL 단축] URL 복사 실패:", error);
        setError("URL 복사에 실패했습니다.");
      });
  }, [shortUrl]);

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && longUrl.trim()) {
      shortenUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
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
            URL 단축
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            긴 URL을 짧고 간단한 링크로 변환할 수 있습니다. 프리뷰 페이지 없이 바로
            원하는 페이지로 이동하는 단축 URL을 생성합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 왼쪽: 입력 영역 */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-500" />
                URL 입력
              </h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label="긴 URL"
                    type="url"
                    value={longUrl}
                    onChange={(e) => {
                      setLongUrl(e.target.value);
                      setShortUrl("");
                      setError("");
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="https://example.com 또는 example.com"
                    error={!!error}
                    errorMessage={error}
                    helperText="http:// 또는 https://로 시작하는 URL을 입력하세요."
                    disabled={isLoading}
                  />
                </div>
                <Button
                  fullWidth
                  onClick={shortenUrl}
                  disabled={!longUrl.trim() || isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      단축 중...
                    </>
                  ) : (
                    "단축하기"
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* 오른쪽: 결과 영역 */}
          <div className="space-y-6">
            <Card padding="md">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                단축된 URL
              </h2>
              <div className="space-y-4">
                {shortUrl ? (
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="단축된 주소"
                        type="text"
                        value={shortUrl}
                        readOnly
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        단축된 URL이 생성되었습니다. 복사 버튼을 클릭하여 클립보드에
                        복사할 수 있습니다.
                      </p>
                    </div>
                    <div className="flex gap-2">
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
                            복사
                          </>
                        )}
                      </Button>
                      <Button
                        fullWidth
                        variant="ghost"
                        onClick={() => {
                          window.open(shortUrl, "_blank", "noopener,noreferrer");
                        }}
                      >
                        열기
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Link2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      URL을 입력하고 단축하기 버튼을 클릭해주세요.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* 사용 가이드 */}
        <Card padding="md" className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            사용 방법
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">1.</span>
              <span>
                위 입력창에 단축하고 싶은 긴 URL을 입력하세요. (예:
                https://example.com/very/long/url)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">2.</span>
              <span>&quot;단축하기&quot; 버튼을 클릭하거나 Enter 키를 누르세요.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">3.</span>
              <span>
                생성된 짧은 URL이 표시됩니다. &quot;복사&quot; 버튼을 클릭하여 클립보드에
                복사할 수 있습니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">4.</span>
              <span>
                복사한 URL을 원하는 곳에 붙여넣어 사용하세요. 단축된 URL은 원본
                URL로 자동으로 리다이렉트됩니다.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

