import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이자 계산기',
  description: '대출이자 계산기와 예적금 예상 수령액 계산기를 제공합니다. 대출 상환 방법별 이자 계산과 예적금 만기 수령액을 쉽게 계산할 수 있습니다.',
  keywords: ['이자 계산기', '대출이자 계산', '예적금 계산', '대출 상환 계산', '이자율 계산'],
  alternates: {
    canonical: '/tools/interest-calculator',
  },
  openGraph: {
    title: '이자 계산기 - 대출이자 및 예적금 계산',
    description: '대출이자 계산기와 예적금 예상 수령액 계산기를 제공합니다.',
    type: 'website',
    url: '/tools/interest-calculator',
  },
  twitter: {
    card: 'summary',
    title: '이자 계산기 - 대출이자 및 예적금 계산',
    description: '대출이자 계산기와 예적금 예상 수령액 계산기를 제공합니다.',
  },
};

export default function InterestCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

