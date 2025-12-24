import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://adtoolkit.kr'),
  title: {
    default: "마케팅 도구 모음 - 광고 성과 계산 및 분석 도구",
    template: "%s | 마케팅 도구 모음",
  },
  description: "ROI 계산기, 광고 예산 계산기, 키워드 분석, 손익분기점 계산 등 다양한 마케팅 도구를 무료로 제공합니다. 광고 성과를 최적화하고 비즈니스 성장을 가속화하세요.",
  keywords: [
    "마케팅 도구",
    "ROI 계산기",
    "광고 예산 계산기",
    "키워드 분석",
    "손익분기점 계산",
    "광고 성과 분석",
    "마케팅 분석",
    "디지털 마케팅",
    "광고 최적화",
    "CRO 계산기",
  ],
  authors: [{ name: "AD Toolkit" }],
  creator: "AD Toolkit",
  publisher: "AD Toolkit",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "마케팅 도구 모음",
    title: "마케팅 도구 모음 - 광고 성과 계산 및 분석 도구",
    description: "ROI 계산기, 광고 예산 계산기, 키워드 분석 등 다양한 마케팅 도구를 무료로 제공합니다.",
    images: [
      {
        url: "/adtoolkit_logo.jpg",
        width: 1200,
        height: 630,
        alt: "마케팅 도구 모음",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "마케팅 도구 모음 - 광고 성과 계산 및 분석 도구",
    description: "ROI 계산기, 광고 예산 계산기, 키워드 분석 등 다양한 마케팅 도구를 무료로 제공합니다.",
    images: ["/adtoolkit_logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console, Naver Search Advisor 등 검증 코드 추가 가능
    // google: "your-google-verification-code",
    // other: {
    //   "naver-site-verification": "your-naver-verification-code",
    // },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 폰트 로딩 최적화: preconnect로 DNS 조회 시간 단축 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
          // font-display: swap은 CSS에서 처리됨 (CLS 최소화)
        />
      </head>
      <body className="antialiased text-gray-900 dark:text-white bg-[#F8F9FA] dark:bg-gray-900">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
