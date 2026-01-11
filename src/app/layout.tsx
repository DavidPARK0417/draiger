import type { Metadata } from "next";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://adtoolkit.kr'),
  title: {
    default: "Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구",
    template: "%s | Draiger : 데일리 툴킷",
  },
  description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 블로그 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
  keywords: [
    "Draiger",
    "데일리 툴킷",
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
    "스마트 도구",
  ],
  authors: [{ name: "Draiger" }],
  creator: "Draiger",
  publisher: "Draiger",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Draiger : 데일리 툴킷",
    title: "Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구",
    description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 블로그 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
    images: [
      {
        url: "/adtoolkit_logo.jpg",
        width: 1200,
        height: 630,
        alt: "Draiger : 데일리 툴킷",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구",
    description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 블로그 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/Favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/Icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon",
        url: "/Icon-180x180.png",
      },
    ],
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
        {/* 파비콘 링크 태그 - 명시적으로 추가하여 외부 서비스 인식 향상 */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/Favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/Favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/Icon-180x180.png" />
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased text-gray-900 dark:text-white bg-[#F8F9FA] dark:bg-gray-900">
        <ThemeProvider>
          <ConditionalHeader />
          {children}
          <ScrollToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
