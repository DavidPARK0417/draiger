import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROI 계산기',
  description: '투자 대비 수익률(ROI)을 계산하여 광고 효과를 측정하세요. 투자금, 매출, 비용을 입력하면 순이익, ROI, ROAS를 자동으로 계산합니다.',
  keywords: ['ROI 계산기', '투자 수익률', 'ROAS 계산', '광고 효과 측정', '마케팅 ROI'],
  alternates: {
    canonical: '/tools/roi-calculator',
  },
  openGraph: {
    title: 'ROI 계산기 - 투자 대비 수익률 계산',
    description: '투자 대비 수익률(ROI)을 계산하여 광고 효과를 측정하세요.',
    type: 'website',
    url: '/tools/roi-calculator',
  },
  twitter: {
    card: 'summary',
    title: 'ROI 계산기 - 투자 대비 수익률 계산',
    description: '투자 대비 수익률(ROI)을 계산하여 광고 효과를 측정하세요.',
  },
};

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

