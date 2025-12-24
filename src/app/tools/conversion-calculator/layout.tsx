import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CRO 전환율 최적화 계산기',
  description: '전환율 개선에 따른 월간/연간 예상 매출 증가액과 추가 확보 전환수를 계산하세요. CRO 최적화 효과를 정량적으로 분석하세요.',
  keywords: ['CRO 계산기', '전환율 최적화', '전환율 개선', '매출 증가 계산', 'CRO 분석'],
  alternates: {
    canonical: '/tools/conversion-calculator',
  },
  openGraph: {
    title: 'CRO 전환율 최적화 계산기 - 전환율 개선 효과 계산',
    description: '전환율 개선에 따른 월간/연간 예상 매출 증가액과 추가 확보 전환수를 계산하세요.',
    type: 'website',
    url: '/tools/conversion-calculator',
  },
  twitter: {
    card: 'summary',
    title: 'CRO 전환율 최적화 계산기 - 전환율 개선 효과 계산',
    description: '전환율 개선에 따른 월간/연간 예상 매출 증가액과 추가 확보 전환수를 계산하세요.',
  },
};

export default function ConversionCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

