import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR코드 생성기",
  description:
    "텍스트, URL, 연락처 정보 등을 QR코드로 변환할 수 있습니다. 다양한 크기와 스타일 옵션을 제공합니다.",
  keywords: ["QR코드", "QR코드 생성", "QR코드 생성기", "QR 코드", "QR 생성"],
  alternates: {
    canonical: "/tools/qr-code-generator",
  },
  openGraph: {
    title: "QR코드 생성기 - QR코드 생성 도구",
    description: "텍스트, URL, 연락처 정보 등을 QR코드로 변환할 수 있습니다.",
    type: "website",
    url: "/tools/qr-code-generator",
  },
  twitter: {
    card: "summary",
    title: "QR코드 생성기 - QR코드 생성 도구",
    description: "텍스트, URL, 연락처 정보 등을 QR코드로 변환할 수 있습니다.",
  },
};

export default function QRCodeGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
