import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/notion';
import { getBaseUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  // 인사이트 포스트 가져오기
  let insightPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    insightPosts = posts.map((post) => ({
      url: `${baseUrl}/insight/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching insight posts for sitemap:', error);
  }

  // 카테고리 페이지 추가
  const categories = [
    '내일의 AI',
    '돈이 되는 소식',
    '궁금한 세상 이야기',
    '슬기로운 생활',
    '오늘보다 건강하게',
    '마음 채우기',
    '기타',
  ];
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/insight/category/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools/roi-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/budget-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/ad-performance`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/keyword-analysis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/break-even-point`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/conversion-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/profitability-diagnosis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...categoryPages,
    ...insightPosts,
  ];
}

