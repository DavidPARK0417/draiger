import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '손익분기점 계산기',
  description: '고정비와 변동비를 기반으로 손익분기점을 계산하여 최소 판매 목표를 설정하세요. 손익분기점 판매량과 매출을 자동으로 계산합니다.',
  keywords: ['손익분기점 계산기', '손익분기점', '고정비 변동비', '최소 판매량', '수익성 분석'],
  alternates: {
    canonical: '/tools/break-even-point',
  },
  openGraph: {
    title: '손익분기점 계산기 - 최소 판매 목표 계산',
    description: '고정비와 변동비를 기반으로 손익분기점을 계산하여 최소 판매 목표를 설정하세요.',
    type: 'website',
    url: '/tools/break-even-point',
  },
  twitter: {
    card: 'summary',
    title: '손익분기점 계산기 - 최소 판매 목표 계산',
    description: '고정비와 변동비를 기반으로 손익분기점을 계산하여 최소 판매 목표를 설정하세요.',
  },
};

export default function BreakEvenPointLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

