import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인사이트 | 드라이거 (Draiger)",
  description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트되는 인사이트 콘텐츠를 만나보세요.",
  alternates: {
    canonical: "/insight",
  },
  openGraph: {
    title: "인사이트 | 드라이거 (Draiger)",
    description: "마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트되는 인사이트 콘텐츠를 만나보세요.",
    type: "website",
  },
};

export default function InsightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 인사이트 페이지에서는 Header를 표시하지 않음 (Navbar 사용)
  return <>{children}</>;
}

