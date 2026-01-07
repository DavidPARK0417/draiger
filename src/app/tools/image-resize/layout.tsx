import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이미지크기 조정',
  description: '이미지 크기를 픽셀 또는 퍼센트 단위로 조정할 수 있습니다. 여러 이미지를 한 번에 처리하고 ZIP 파일로 다운로드할 수 있습니다.',
  keywords: ['이미지 리사이즈', '이미지 크기 조정', '이미지 변환', '이미지 처리', '배치 이미지 처리'],
  alternates: {
    canonical: '/tools/image-resize',
  },
  openGraph: {
    title: '이미지크기 조정 - 이미지 크기 조정 도구',
    description: '이미지 크기를 픽셀 또는 퍼센트 단위로 조정할 수 있습니다.',
    type: 'website',
    url: '/tools/image-resize',
  },
  twitter: {
    card: 'summary',
    title: '이미지크기 조정 - 이미지 크기 조정 도구',
    description: '이미지 크기를 픽셀 또는 퍼센트 단위로 조정할 수 있습니다.',
  },
};

export default function ImageResizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

