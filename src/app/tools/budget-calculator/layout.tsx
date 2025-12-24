import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '광고 예산 계산기',
  description: '목표 전환수와 CPC를 기반으로 필요한 광고 예산을 계산하세요. 목표 전환수, CPC, 전환율을 입력하면 필요한 클릭수와 예산을 자동으로 계산합니다.',
  keywords: ['광고 예산 계산기', '광고비 계산', 'CPC 계산', '전환수 계산', '마케팅 예산'],
  alternates: {
    canonical: '/tools/budget-calculator',
  },
  openGraph: {
    title: '광고 예산 계산기 - 목표 전환수 기반 예산 계산',
    description: '목표 전환수와 CPC를 기반으로 필요한 광고 예산을 계산하세요.',
    type: 'website',
    url: '/tools/budget-calculator',
  },
  twitter: {
    card: 'summary',
    title: '광고 예산 계산기 - 목표 전환수 기반 예산 계산',
    description: '목표 전환수와 CPC를 기반으로 필요한 광고 예산을 계산하세요.',
  },
};

export default function BudgetCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

