import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '파비콘 생성기 | ADToolkit',
  description: '이미지를 업로드하여 웹사이트용 파비콘을 생성하세요. 다양한 사이즈의 파비콘 파일을 ZIP으로 다운로드할 수 있습니다.',
  keywords: ['파비콘', 'favicon', '파비콘 생성', '웹사이트 아이콘', '파비콘 변환'],
  alternates: {
    canonical: '/tools/favicon-generator',
  },
  openGraph: {
    title: '파비콘 생성기 - 웹사이트 파비콘 생성 도구',
    description: '이미지를 업로드하여 웹사이트용 파비콘을 생성하세요.',
    type: 'website',
    url: '/tools/favicon-generator',
  },
  twitter: {
    card: 'summary',
    title: '파비콘 생성기 - 웹사이트 파비콘 생성 도구',
    description: '이미지를 업로드하여 웹사이트용 파비콘을 생성하세요.',
  },
};

export default function FaviconGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

