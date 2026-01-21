import { NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/notion';
import { getBaseUrl } from '@/lib/site';

/**
 * RSS 2.0 피드 생성
 * 경로: /feed (또는 /feed.xml로 리다이렉트)
 */
export async function GET() {
  try {
    const baseUrl = getBaseUrl();
    const posts = await getPublishedPosts();

    // 최신 20개 포스트만 포함 (RSS 피드 크기 제한)
    const recentPosts = posts.slice(0, 20);

    // RSS 2.0 XML 생성
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Draiger : 데일리 툴킷</title>
    <link>${baseUrl}</link>
    <description>마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed" rel="self" type="application/rss+xml"/>
    <generator>Next.js</generator>
    <webMaster>decidepyb@gmail.com (박용범)</webMaster>
    <managingEditor>decidepyb@gmail.com (박용범)</managingEditor>
    <copyright>© ${new Date().getFullYear()} Draiger : 데일리 툴킷. All rights reserved.</copyright>
    ${recentPosts
      .map((post) => {
        const postUrl = `${baseUrl}/insight/${post.slug}`;
        const pubDate = post.date
          ? new Date(post.date).toUTCString()
          : new Date().toUTCString();
        
        // HTML 태그 제거 및 이스케이프
        const description = post.metaDescription || post.title;
        const escapedDescription = description
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
        
        const escapedTitle = post.title
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        // 카테고리 추가 (있는 경우)
        const categoryTag = post.category
          ? `<category>${post.category.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</category>`
          : '';

        // 이미지 추가 (있는 경우)
        const imageTag = post.featuredImage
          ? `<enclosure url="${post.featuredImage}" type="image/jpeg"/>`
          : '';

        return `    <item>
      <title>${escapedTitle}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapedDescription}</description>
      <pubDate>${pubDate}</pubDate>
      ${categoryTag}
      ${imageTag}
    </item>`;
      })
      .join('\n')}
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    
    // 에러 발생 시 빈 RSS 피드 반환 (404 대신)
    const baseUrl = getBaseUrl();
    const errorRssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Draiger : 데일리 툴킷</title>
    <link>${baseUrl}</link>
    <description>RSS 피드를 생성하는 중 오류가 발생했습니다.</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

    return new NextResponse(errorRssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

