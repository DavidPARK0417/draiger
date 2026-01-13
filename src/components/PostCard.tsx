"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Post } from "@/lib/notion";
import Image from "next/image";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  index: number;
  isLarge?: boolean; // 큰 카드인지 여부
}

export default function PostCard({ post, index, isLarge = false }: PostCardProps) {
  const [imageError, setImageError] = useState(false);

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
      className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors h-full ${
        isLarge ? "p-8" : "p-4 sm:p-6"
      }`}
    >
      <Link href={`/insight/${post.slug}`} className="absolute inset-0 z-10" />

      <div className={`flex flex-col h-full ${isLarge ? 'gap-6' : 'gap-3 sm:gap-4'}`}>
        {/* 이미지가 있을 때 작은 이미지 표시 - 텍스트와 함께 보이도록 */}
        {post.featuredImage && !imageError && (
          <div className={`relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 ${
            isLarge 
              ? "h-32 sm:h-40 lg:h-48" 
              : "h-20 sm:h-24"
          }`}>
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
              onError={() => {
                console.log('이미지 로드 실패:', post.featuredImage);
                setImageError(true);
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

