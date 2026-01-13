import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "Draiger : 데일리 툴킷에 대해 알아보세요.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

