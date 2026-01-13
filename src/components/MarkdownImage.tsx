"use client";

import { useState, useEffect } from "react";

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  [key: string]: unknown;
}

// URL 정규화 함수: thumbnews URL은 원본 그대로 사용 (실제로 작동함)
// 참고: thumbnews.nateimg.co.kr/view610///news.nateimg.co.kr/... 형식도 실제로 작동함
function normalizeImageUrl(url: string): string {
  if (!url) return url;
  
  // 단순히 앞뒤 공백만 제거 (URL 변환하지 않음)
  // thumbnews URL은 원본 그대로 사용하면 정상 작동함
  return url.trim();
}

// 마크다운 형식이 포함된 URL에서 실제 URL만 추출
function extractImageUrl(src: string): string {
  if (!src) return src;
  
  // URL 디코딩
  let decoded = src;
  try {
    decoded = decodeURIComponent(src);
  } catch {
    // 디코딩 실패 시 원본 사용
    decoded = src;
  }
  
  // 마크다운 형식이 포함된 경우: ![filename](url) 또는 !%5Bfilename%5D(url)
  // 실제 URL만 추출
  const markdownPattern = /!\[.*?\]\((https?:\/\/[^\)]+)\)/;
  const markdownMatch = decoded.match(markdownPattern);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }
  
  // URL 인코딩된 마크다운 형식: !%5Bfilename%5D(url)
  const encodedMarkdownPattern = /!%5B.*?%5D\((https?:\/\/[^\)]+)\)/;
  const encodedMatch = decoded.match(encodedMarkdownPattern);
  if (encodedMatch && encodedMatch[1]) {
    return encodedMatch[1];
  }
  
  // 일반 URL 패턴에서 실제 URL 추출
  // 잘못된 형식: "url/!%5Bfilename%5D(url)" -> "url" 부분만 추출
  const urlPattern = /(https?:\/\/[^\s\)]+?)(?:\/!\[|%5B|\(https?:\/\/)/;
  const urlMatch = decoded.match(urlPattern);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  // 순수 URL인 경우 그대로 반환
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    return normalizeImageUrl(decoded);
  }
  
  return normalizeImageUrl(decoded);
}

export default function MarkdownImage({ src, alt, ...props }: MarkdownImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [proxySrc, setProxySrc] = useState<string | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // URL 정규화 및 상태 설정
  useEffect(() => {
    if (src) {
      const extracted = extractImageUrl(src);
      const normalized = normalizeImageUrl(extracted);
      setImageSrc(normalized);
      setHasError(false); // URL이 변경되면 에러 상태 리셋
      setRetryCount(0); // 재시도 횟수 리셋
      
      // 외부 이미지인 경우 프록시 URL 생성
      if (normalized && (normalized.startsWith('http://') || normalized.startsWith('https://'))) {
        try {
          const urlObj = new URL(normalized);
          // 외부 도메인인 경우 프록시 사용
          // 브라우저 환경에서만 hostname 비교
          const isExternal = typeof window !== 'undefined' 
            ? urlObj.hostname !== window.location.hostname
            : !urlObj.hostname.includes('localhost') && !urlObj.hostname.includes('127.0.0.1');
          
          if (isExternal) {
            // 프록시 URL 생성
            const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(normalized)}`;
            setProxySrc(proxyUrl);
            console.log('[MarkdownImage] ✅ 프록시 URL 생성:', {
              original: normalized.substring(0, 100),
              proxy: proxyUrl.substring(0, 100),
              isExternal: true
            });
          } else {
            // 내부 이미지는 원본 URL 사용
            setProxySrc(normalized);
            console.log('[MarkdownImage] 내부 이미지 (원본 URL 사용):', normalized.substring(0, 100));
          }
        } catch {
          setProxySrc(normalized);
        }
      } else {
        setProxySrc(normalized);
      }
      
      // 디버깅: URL 추출 과정 로그 (항상 로그 출력)
      console.log('[MarkdownImage] URL 처리:', {
        original: src.substring(0, 150),
        extracted: extracted.substring(0, 150),
        normalized: normalized.substring(0, 150),
        proxySrc: proxySrc?.substring(0, 150),
        changed: src !== normalized,
        hasError: false
      });
    } else {
      console.warn('[MarkdownImage] ⚠️ src가 없습니다:', { src, alt });
    }
  }, [src, alt, proxySrc]);

  // 이미지가 없으면 렌더링하지 않음
  if (!imageSrc || !proxySrc) {
    console.warn('[MarkdownImage] ⚠️ imageSrc 또는 proxySrc가 없어 렌더링하지 않습니다:', { 
      src, 
      alt, 
      imageSrc, 
      proxySrc 
    });
    return null;
  }
  
  if (hasError && retryCount >= maxRetries) {
    console.error('[MarkdownImage] ❌ 모든 재시도 실패:', imageSrc);
    // 에러가 발생해도 fallback UI 표시
  }

  return (
    <div className="my-8 sm:my-10 lg:my-12">
      {hasError ? (
        // 이미지 로드 실패 시 fallback
        <div className="
          w-full
          h-64 sm:h-80 lg:h-96
          rounded-xl sm:rounded-2xl
          bg-gray-100 dark:bg-gray-800
          flex items-center justify-center
          border-2 border-dashed border-gray-300 dark:border-gray-700
        ">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              이미지를 불러올 수 없습니다
            </p>
            {imageSrc && (
              <a
                href={imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-2
                  text-xs sm:text-sm
                  text-emerald-500 hover:text-emerald-600
                  dark:text-emerald-400 dark:hover:text-emerald-300
                  underline
                "
              >
                직접 보기
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          <img
            key={`${proxySrc}-${retryCount}`}
            src={proxySrc}
            alt={alt || "이미지"}
            className="
              w-full
              h-auto
              rounded-xl sm:rounded-2xl
              shadow-lg dark:shadow-gray-900/50
              object-contain
              bg-gray-100 dark:bg-gray-800
              transition-all duration-300
              hover:shadow-xl dark:hover:shadow-gray-900/70
            "
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // 이미지 로드 실패 시 상세한 에러 정보 로깅
              const target = e.target as HTMLImageElement;
              console.error('[MarkdownImage] ❌ 이미지 로드 실패:', {
                originalSrc: imageSrc,
                proxySrc: proxySrc,
                retryCount,
                naturalWidth: target.naturalWidth,
                naturalHeight: target.naturalHeight,
                complete: target.complete
              });
              
              // 재시도 로직: 프록시가 실패하면 원본 URL로 재시도
              if (retryCount < maxRetries) {
                const nextRetry = retryCount + 1;
                console.log(`[MarkdownImage] 🔄 재시도 ${nextRetry}/${maxRetries}...`);
                
                // 재시도 간격 증가 (500ms, 1000ms, 1500ms)
                setTimeout(() => {
                  setRetryCount(nextRetry);
                  setHasError(false);
                  // 마지막 재시도에서는 원본 URL 사용
                  if (nextRetry === maxRetries && imageSrc) {
                    console.log('[MarkdownImage] 🔄 원본 URL로 재시도:', imageSrc);
                    setProxySrc(imageSrc);
                  }
                }, 500 * nextRetry);
              } else {
                console.error('[MarkdownImage] ❌ 모든 재시도 실패:', imageSrc);
                setHasError(true);
              }
            }}
            onLoad={() => {
              console.log('[MarkdownImage] ✅ 이미지 로드 성공:', {
                originalSrc: imageSrc,
                proxySrc: proxySrc
              });
              setHasError(false);
              setRetryCount(0); // 성공 시 재시도 횟수 리셋
            }}
            {...props}
          />
        </div>
      )}
      {alt && (
        <div className="
          mt-3 sm:mt-4
          text-xs sm:text-sm
          text-center
          text-gray-500 dark:text-gray-400
          italic
        ">
          {alt}
        </div>
      )}
    </div>
  );
}

