import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '파일 미리보기',
  description: 'PDF, 이미지, Word, Excel, PowerPoint, 텍스트 파일 등을 브라우저에서 바로 미리보기할 수 있습니다. 파일은 서버에 저장되지 않습니다.',
  keywords: ['파일 미리보기', 'PDF 뷰어', '문서 미리보기', '파일 뷰어', '온라인 뷰어'],
  alternates: {
    canonical: '/tools/file-preview',
  },
  openGraph: {
    title: '파일 미리보기 - 온라인 파일 뷰어',
    description: '다양한 파일 형식을 브라우저에서 바로 미리보기할 수 있습니다.',
    type: 'website',
    url: '/tools/file-preview',
  },
  twitter: {
    card: 'summary',
    title: '파일 미리보기 - 온라인 파일 뷰어',
    description: '다양한 파일 형식을 브라우저에서 바로 미리보기할 수 있습니다.',
  },
};

export default function FilePreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

