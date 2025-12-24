import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '문의하기',
  description: '마케팅 도구의 오류나 문제점, 추가하고 싶은 기능이 있다면 언제든지 문의해주세요. 빠른 시일 내에 답변드리겠습니다.',
  keywords: ['문의하기', '고객 지원', '피드백', '기능 제안', '버그 리포트'],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: '문의하기 - 마케팅 도구 모음',
    description: '마케팅 도구의 오류나 문제점, 추가하고 싶은 기능이 있다면 언제든지 문의해주세요.',
    type: 'website',
    url: '/contact',
  },
  twitter: {
    card: 'summary',
    title: '문의하기 - 마케팅 도구 모음',
    description: '마케팅 도구의 오류나 문제점, 추가하고 싶은 기능이 있다면 언제든지 문의해주세요.',
  },
  robots: {
    index: false, // 문의 페이지는 검색 결과에 노출하지 않음
    follow: true,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

