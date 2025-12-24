import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '마케팅 수익성 진단',
  description: '목표 CPA, LTV, LTV:CAC 비율을 3단계로 진단하여 광고 예산을 최적화하세요. 마케팅 수익성을 종합적으로 분석합니다.',
  keywords: ['수익성 진단', 'CPA 분석', 'LTV 계산', 'LTV CAC 비율', '마케팅 수익성'],
  alternates: {
    canonical: '/tools/profitability-diagnosis',
  },
  openGraph: {
    title: '마케팅 수익성 진단 - CPA 및 LTV 분석',
    description: '목표 CPA, LTV, LTV:CAC 비율을 3단계로 진단하여 광고 예산을 최적화하세요.',
    type: 'website',
    url: '/tools/profitability-diagnosis',
  },
  twitter: {
    card: 'summary',
    title: '마케팅 수익성 진단 - CPA 및 LTV 분석',
    description: '목표 CPA, LTV, LTV:CAC 비율을 3단계로 진단하여 광고 예산을 최적화하세요.',
  },
};

export default function ProfitabilityDiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

