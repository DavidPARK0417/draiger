import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "세계시간 변환기",
  description:
    "전 세계 주요 도시의 현재 시간을 확인하고 시간대를 변환할 수 있습니다. 여러 도시의 시간을 동시에 비교할 수 있습니다.",
  keywords: ["세계시간", "시간대 변환", "타임존", "세계시", "시간 변환기"],
  alternates: {
    canonical: "/tools/world-time-converter",
  },
  openGraph: {
    title: "세계시간 변환기 - 시간대 변환 도구",
    description:
      "전 세계 주요 도시의 현재 시간을 확인하고 시간대를 변환할 수 있습니다.",
    type: "website",
    url: "/tools/world-time-converter",
  },
  twitter: {
    card: "summary",
    title: "세계시간 변환기 - 시간대 변환 도구",
    description:
      "전 세계 주요 도시의 현재 시간을 확인하고 시간대를 변환할 수 있습니다.",
  },
};

export default function WorldTimeConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
