"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Post } from "@/lib/notion";
import Image from "next/image";

interface PostCardProps {
  post: Post;
  index: number;
  isLarge?: boolean; // 큰 카드인지 여부
}

export default function PostCard({ post, index, isLarge = false }: PostCardProps) {
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
      className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-8 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors h-full"
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" />

      <div className="flex flex-col h-full justify-between gap-12">
        {/* 큰 카드이고 이미지가 있을 때 이미지 표시 */}
        {isLarge && post.featuredImage && (
          <div className="relative w-full h-48 sm:h-64 lg:h-80 mb-6 rounded-xl overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}

        <div>
          <h3 className="text-3xl font-serif mb-4 group-hover:translate-x-2 transition-transform duration-500 text-gray-900 dark:text-white">
            {post.title}
          </h3>
          <p className="text-gray-600 dark:text-white/50 line-clamp-2 text-sm leading-relaxed">
            {post.metaDescription}
          </p>
        </div>

        <div className="flex justify-between items-end">
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

