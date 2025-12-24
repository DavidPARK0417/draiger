import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '광고 성과 계산',
  description: '여러 상품의 광고 성과를 비교하고 최적의 상품을 찾아보세요. 판매가, 순이익, 광고비, 전환수를 입력하면 ROAS, ROI, 순이익을 자동으로 계산합니다.',
  keywords: ['광고 성과 계산', '상품 비교', 'ROAS 계산', '광고 효과 분석', '마케팅 성과'],
  alternates: {
    canonical: '/tools/ad-performance',
  },
  openGraph: {
    title: '광고 성과 계산 - 여러 상품 성과 비교',
    description: '여러 상품의 광고 성과를 비교하고 최적의 상품을 찾아보세요.',
    type: 'website',
    url: '/tools/ad-performance',
  },
  twitter: {
    card: 'summary',
    title: '광고 성과 계산 - 여러 상품 성과 비교',
    description: '여러 상품의 광고 성과를 비교하고 최적의 상품을 찾아보세요.',
  },
};

export default function AdPerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

