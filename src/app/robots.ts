import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adtoolkit.kr';

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

