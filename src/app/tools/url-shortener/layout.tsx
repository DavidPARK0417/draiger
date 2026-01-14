import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL 단축",
  description:
    "긴 URL을 짧고 간단한 링크로 변환할 수 있습니다. 프리뷰 페이지 없이 바로 원하는 페이지로 이동하는 단축 URL을 생성합니다.",
  keywords: [
    "URL 단축",
    "링크 단축",
    "URL 줄이기",
    "짧은 링크",
    "URL shortener",
    "is.gd",
    "v.gd",
  ],
  alternates: {
    canonical: "/tools/url-shortener",
  },
  openGraph: {
    title: "URL 단축 - 링크 단축 도구",
    description: "긴 URL을 짧고 간단한 링크로 변환할 수 있습니다.",
    type: "website",
    url: "/tools/url-shortener",
  },
  twitter: {
    card: "summary",
    title: "URL 단축 - 링크 단축 도구",
    description: "긴 URL을 짧고 간단한 링크로 변환할 수 있습니다.",
  },
};

export default function UrlShortenerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

