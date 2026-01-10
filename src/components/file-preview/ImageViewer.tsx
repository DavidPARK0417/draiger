"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ImageViewerProps {
  url: string;
}

export default function ImageViewer({ url }: ImageViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">이미지 로드 중...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      <div className={`
        relative max-w-full
        transition-opacity duration-300
        ${isLoading ? 'opacity-0' : 'opacity-100'}
      `}>
        <Image
          src={url}
          alt="미리보기"
          width={800}
          height={600}
          className="max-w-full h-auto rounded-lg shadow-lg"
          unoptimized
          onLoad={() => {
            setIsLoading(false);
            setError(null);
          }}
          onError={() => {
            setIsLoading(false);
            setError("이미지를 불러오는 중 오류가 발생했습니다.");
          }}
        />
      </div>
    </div>
  );
}

