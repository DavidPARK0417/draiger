import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ConditionalHeader from "@/components/ConditionalHeader";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAServiceWorker from "@/components/PWAServiceWorker";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구",
    template: "%s | Draiger : 데일리 툴킷",
  },
  description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
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
  authors: [{ name: "박용범" }],
  creator: "박용범",
  publisher: "박용범",
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
    description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
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
    description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
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
    google: "N3s-tHYhtlKyDSxzPPxWl5svLx4k4Dib4NaYuQFDpfo",
    other: {
      "naver-site-verification": "25126cf83b729c9a888938b4ca47df111ba24c08",
    },
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
          // 캐시 무효화를 위한 버전 쿼리 파라미터 추가
          key="pretendard-font"
        />
        {/* 
          파비콘은 Next.js App Router가 app/favicon.ico를 자동으로 처리합니다.
          추가적인 아이콘 링크는 메타데이터의 icons 설정으로 처리되므로
          여기서는 중복 링크 태그를 제거했습니다.
        */}
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        {/* PWA Meta Tags */}
        <meta name="application-name" content="드라이거" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="드라이거" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#10B981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#10B981" />
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/Icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Draiger RSS Feed" href="/feed" />
        {/* Naver Site Verification */}
        <meta name="naver-site-verification" content="25126cf83b729c9a888938b4ca47df111ba24c08" />
      </head>
      <body className="antialiased text-gray-900 dark:text-white bg-[#F8F9FA] dark:bg-gray-900" suppressHydrationWarning>
        {/* 구조화된 데이터 (JSON-LD) - SEO 최적화 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Draiger : 데일리 툴킷",
              "url": getBaseUrl(),
              "description": "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.",
              "author": {
                "@type": "Person",
                "name": "박용범",
                "email": "decidepyb@gmail.com"
              },
              "publisher": {
                "@type": "Person",
                "name": "박용범",
                "email": "decidepyb@gmail.com"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${getBaseUrl()}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KNKPF6R6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-KNKPF6R6');
            `,
          }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YKRVFJM5V1"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-YKRVFJM5V1');
            `,
          }}
        />
        <ThemeProvider>
          <PWAServiceWorker />
          {/* 전체 페이지 레이아웃: Header, Main, Footer 구조 */}
          <div className="flex flex-col min-h-screen">
            {/* 헤더: 모든 페이지에 표시 */}
            <ConditionalHeader />
            {/* 메인 콘텐츠: 각 페이지의 내용 */}
            <main className="flex-grow">
              {children}
            </main>
            {/* 푸터: 모든 페이지에 표시 */}
            <Footer />
          </div>
          {/* 위로가기 버튼 */}
          <ScrollToTop />
          {/* PWA 설치 프롬프트 */}
          <PWAInstallPrompt />
        </ThemeProvider>
        {/* Kakao AdFit 스크립트 (공식 문서: </body> 바로 위에 설치, async 속성 필수) */}
        {/* Next.js에서는 일반 script 태그가 제대로 작동하지 않을 수 있으므로 Script 컴포넌트 사용 */}
        <Script
          src="https://t1.daumcdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
          type="text/javascript"
          charSet="utf-8"
        />
      </body>
    </html>
  );
}
