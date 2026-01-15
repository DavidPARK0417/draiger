import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "후원하기 | Draiger : 데일리 툴킷",
  description:
    "서비스 개발을 응원해주세요. Buy Me a Coffee, Toss 송금으로 후원할 수 있습니다.",
  openGraph: {
    title: "후원하기 | Draiger : 데일리 툴킷",
    description:
      "서비스 개발을 응원해주세요. Buy Me a Coffee, Toss 송금으로 후원할 수 있습니다.",
    type: "website",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

