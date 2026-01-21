import { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'], // API만 크롤링 제외 (문의 페이지는 사용자가 접근 가능해야 함)
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

