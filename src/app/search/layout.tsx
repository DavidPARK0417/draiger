import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "검색 | 드라이거 (Draiger)",
  description: "드라이거의 인사이트 콘텐츠와 스마트 도구를 검색해보세요.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "검색 | 드라이거 (Draiger)",
    description: "드라이거의 인사이트 콘텐츠와 스마트 도구를 검색해보세요.",
    type: "website",
  },
};

export default function SearchLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}

