import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오늘의메뉴",
  description: "Notion과 연동하여 매일 자동으로 업데이트되는 요리 레시피를 제공합니다. 다양한 요리 방법과 재료 정보를 통해 일상의 식사 준비를 더욱 쉽고 즐겁게 만들어드립니다.",
  keywords: [
    "오늘의메뉴",
    "요리 레시피",
    "레시피",
    "요리",
    "메뉴",
    "요리법",
    "재료",
    "요리 가이드",
    "일상 식사",
  ],
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "오늘의메뉴 - Draiger : 데일리 툴킷",
    description: "Notion과 연동하여 매일 자동으로 업데이트되는 요리 레시피를 제공합니다. 다양한 요리 방법과 재료 정보를 통해 일상의 식사 준비를 더욱 쉽고 즐겁게 만들어드립니다.",
    type: "website",
    url: "/menu",
  },
  twitter: {
    card: "summary",
    title: "오늘의메뉴 - Draiger : 데일리 툴킷",
    description: "Notion과 연동하여 매일 자동으로 업데이트되는 요리 레시피를 제공합니다. 다양한 요리 방법과 재료 정보를 통해 일상의 식사 준비를 더욱 쉽고 즐겁게 만들어드립니다.",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

