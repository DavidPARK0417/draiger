import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 구글 검색 등 다양한 외부 이미지 호스트를 허용하기 위해
    // 모든 HTTPS 호스트를 허용합니다 (보안상 주의 필요)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 모든 HTTPS 호스트 허용
      },
      {
        protocol: "http",
        hostname: "**", // HTTP도 허용 (필요한 경우)
      },
    ],
    // 외부 이미지 최적화 허용
    unoptimized: false,
  },
};

export default nextConfig;
