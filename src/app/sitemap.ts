import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/notion';
import { getAllPublishedRecipes } from '@/lib/notion-recipe';
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

  // 오늘의메뉴 레시피 가져오기
  let menuPosts: MetadataRoute.Sitemap = [];
  try {
    // 모든 레시피를 페이지네이션 없이 가져오기
    const recipes = await getAllPublishedRecipes();
    menuPosts = recipes.map((recipe) => ({
      url: `${baseUrl}/menu/${recipe.slug}`,
      lastModified: recipe.date ? new Date(recipe.date) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching menu recipes for sitemap:', error);
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

  // 모든 도구 페이지 목록
  const toolPages = [
    {
      url: `${baseUrl}/tools/roi-calculator`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/budget-calculator`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/ad-performance`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/keyword-analysis`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/break-even-point`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/conversion-calculator`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/profitability-diagnosis`,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tools/character-counter`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/favicon-generator`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/file-preview`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/image-resize`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/interest-calculator`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/qr-code-generator`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/url-shortener`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/world-time-converter`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/alarm-clock`,
      priority: 0.8,
    },
  ];

  // 기타 페이지 목록
  const otherPages = [
    {
      url: `${baseUrl}/about`,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/support`,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/menu`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      priority: 0.5,
    },
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolPages.map((tool) => ({
      url: tool.url,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: tool.priority,
    })),
    ...otherPages.map((page) => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: page.priority,
    })),
    ...categoryPages,
    ...insightPosts,
    ...menuPosts,
  ];
}

