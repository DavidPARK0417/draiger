"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Post } from "@/lib/notion";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PostCardProps {
  post: Post;
  index: number;
  isLarge?: boolean; // 큰 카드인지 여부
}

// 외부 이미지인 경우 프록시 URL 생성
function getProxyImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // 이미 프록시 URL인 경우 그대로 반환
  if (imageUrl.startsWith('/api/proxy-image')) {
    return imageUrl;
  }
  
  // 외부 이미지인 경우 프록시 URL 생성
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      const urlObj = new URL(imageUrl);
      // 브라우저 환경에서만 hostname 비교
      const isExternal = typeof window !== 'undefined' 
        ? urlObj.hostname !== window.location.hostname && 
          urlObj.hostname !== 'localhost' && 
          urlObj.hostname !== '127.0.0.1'
        : !urlObj.hostname.includes('localhost') && !urlObj.hostname.includes('127.0.0.1');
      
      if (isExternal) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostCard] 프록시 URL 생성:', {
            original: imageUrl.substring(0, 100),
            proxy: proxyUrl.substring(0, 100)
          });
        }
        return proxyUrl;
      }
    } catch (error) {
      console.error('[PostCard] URL 파싱 오류:', error);
    }
  }
  
  return imageUrl;
}

export default function PostCard({ post, index, isLarge = false }: PostCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [retryWithOriginal, setRetryWithOriginal] = useState(false);
  
  // 이미지 URL 처리 (외부 이미지인 경우 프록시 사용)
  useEffect(() => {
    if (post.featuredImage) {
      const proxyUrl = getProxyImageUrl(post.featuredImage);
      setImageSrc(proxyUrl);
      setImageError(false); // URL이 변경되면 에러 상태 리셋
      setRetryWithOriginal(false); // 재시도 상태 리셋
    } else {
      setImageSrc(undefined);
    }
  }, [post.featuredImage]);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors h-full shadow-sm dark:shadow-gray-900/30 ${
        isLarge ? "p-8" : "p-4 sm:p-6"
      }`}
    >
      <Link href={`/insight/${post.slug}`} className="absolute inset-0 z-10" />

      <div className={`flex flex-col h-full ${isLarge ? 'gap-6' : 'gap-3 sm:gap-4'}`}>
        {/* 이미지가 있을 때 작은 이미지 표시 - 텍스트와 함께 보이도록 */}
        {imageSrc && !imageError && (
          <div className={`
            relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0
            aspect-video
            ${isLarge ? "min-h-[180px] sm:min-h-[220px] lg:min-h-[260px]" : "min-h-[120px] sm:min-h-[140px]"}
          `}>
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              onError={(e) => {
                const errorInfo = {
                  original: post.featuredImage,
                  proxy: imageSrc,
                  error: e?.type || 'unknown',
                  target: e?.target ? {
                    src: (e.target as HTMLImageElement)?.src,
                    naturalWidth: (e.target as HTMLImageElement)?.naturalWidth,
                    naturalHeight: (e.target as HTMLImageElement)?.naturalHeight,
                  } : null,
                };
                
                // 프록시 URL로 실패했고 아직 원본으로 재시도하지 않은 경우
                if (imageSrc?.startsWith('/api/proxy-image') && !retryWithOriginal && post.featuredImage) {
                  if (process.env.NODE_ENV === 'development') {
                    console.warn('[PostCard] 프록시 실패, 원본 URL로 재시도:', {
                      proxy: imageSrc,
                      original: post.featuredImage
                    });
                  }
                  setRetryWithOriginal(true);
                  setImageSrc(post.featuredImage);
                  setImageError(false);
                } else {
                  console.error('[PostCard] 이미지 로드 실패:', errorInfo);
                  setImageError(true);
                }
              }}
              onLoad={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[PostCard] ✅ 이미지 로드 성공:', {
                    original: post.featuredImage,
                    proxy: imageSrc
                  });
                }
              }}
            />
          </div>
        )}

        {/* 텍스트 영역 - 항상 보이도록 보장 */}
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${
          isLarge ? "min-h-[120px]" : "min-h-[100px]"
        }`}>
          <h3 className={`font-serif font-semibold mb-2 sm:mb-3 group-hover:translate-x-2 transition-transform duration-500 text-gray-900 dark:text-white line-clamp-2 ${
            isLarge 
              ? "text-lg sm:text-xl lg:text-2xl" 
              : "text-base sm:text-lg"
          }`}>
            {post.title}
          </h3>
          <p className={`text-gray-600 dark:text-white/50 line-clamp-3 leading-relaxed flex-1 ${
            isLarge 
              ? "text-sm sm:text-base" 
              : "text-xs sm:text-sm"
          }`}>
            {post.metaDescription}
          </p>
        </div>

        {/* 하단 Read More 영역 - 하단 고정 */}
        <div className="flex justify-between items-end flex-shrink-0 mt-auto pt-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/30">
            Read More
          </span>
          <div className="w-8 h-8 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:border-gray-900 dark:group-hover:border-white transition-colors duration-500">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:stroke-white dark:group-hover:stroke-black stroke-gray-900 dark:stroke-white transition-colors duration-500"
            >
              <path
                d="M1 11L11 1M11 1H1M11 1V11"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

