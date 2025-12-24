import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '키워드 분석',
  description: '키워드의 검색량, 경쟁도, CPC를 분석하여 최적의 키워드를 찾아보세요. 여러 키워드를 비교하고 마케팅 전략을 수립하세요.',
  keywords: ['키워드 분석', '검색량 분석', '키워드 경쟁도', 'CPC 분석', 'SEO 키워드'],
  alternates: {
    canonical: '/tools/keyword-analysis',
  },
  openGraph: {
    title: '키워드 분석 - 검색량 및 경쟁도 분석',
    description: '키워드의 검색량, 경쟁도, CPC를 분석하여 최적의 키워드를 찾아보세요.',
    type: 'website',
    url: '/tools/keyword-analysis',
  },
  twitter: {
    card: 'summary',
    title: '키워드 분석 - 검색량 및 경쟁도 분석',
    description: '키워드의 검색량, 경쟁도, CPC를 분석하여 최적의 키워드를 찾아보세요.',
  },
};

export default function KeywordAnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

