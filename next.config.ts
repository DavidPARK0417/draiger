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
    // 로컬 이미지 프록시 패턴 허용 (Next.js 16 호환성)
    // 모든 로컬 경로 허용 (public 폴더 이미지 + API 프록시)
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    // 외부 이미지 최적화 허용
    unoptimized: false,
  },
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/feed.xml',
        destination: '/feed',
        permanent: true,
      },
    ];
  },
  // 캐시 헤더 설정: 최신 콘텐츠를 빠르게 반영
  async headers() {
    return [
      {
        // Next.js 빌드 산출물 (CSS, JS 등) - 해시가 포함되어 있어도 짧은 캐시
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 정적 파일 (이미지, 아이콘 등)
        source: '/:path*\\.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        // 모든 페이지에 적용
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
