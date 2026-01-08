import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "글자수 세기",
  description:
    "텍스트의 글자수, 단어수, 줄 수를 실시간으로 계산할 수 있습니다. 공백 포함/제외 옵션을 제공합니다.",
  keywords: [
    "글자수 세기",
    "텍스트 카운터",
    "문자수 계산",
    "단어수 계산",
    "글자수 계산기",
  ],
  alternates: {
    canonical: "/tools/character-counter",
  },
  openGraph: {
    title: "글자수 세기 - 텍스트 글자수 계산 도구",
    description:
      "텍스트의 글자수, 단어수, 줄 수를 실시간으로 계산할 수 있습니다.",
    type: "website",
    url: "/tools/character-counter",
  },
  twitter: {
    card: "summary",
    title: "글자수 세기 - 텍스트 글자수 계산 도구",
    description:
      "텍스트의 글자수, 단어수, 줄 수를 실시간으로 계산할 수 있습니다.",
  },
};

export default function CharacterCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
