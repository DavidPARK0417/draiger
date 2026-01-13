import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Draiger : 데일리 툴킷 이용약관을 확인하세요.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

