import { getLatestPostsByCategory, type Post } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmallPostCard from "@/components/SmallPostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Link from "next/link";
import type { Metadata } from 'next';

// ISR 설정: 10초마다 재검증 (더 빠른 업데이트)
export const revalidate = 10;

// 동적 렌더링 강제 (캐시 우회)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'DRAIGER',
  description: 'A minimal, interactive blog powered by Notion and Next.js.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DRAIGER',
    description: 'A minimal, interactive blog powered by Notion and Next.js.',
    url: '/',
  },
};

// 카테고리 목록
const categories = [
  "내일의 AI",
  "돈이 되는 소식",
  "궁금한 세상 이야기",
  "슬기로운 생활",
  "오늘보다 건강하게",
  "마음 채우기",
  "기타",
];

interface CategorySectionProps {
  category: string;
  posts: Post[];
  sectionIndex: number;
}

function CategorySection({ category, posts, sectionIndex }: CategorySectionProps) {
  if (posts.length === 0) return null;

  const [mainPost, ...smallPosts] = posts;
  const smallPostsToShow = smallPosts.slice(0, 2);

  return (
    <section className="mb-16 sm:mb-20 lg:mb-24">
      {/* 카테고리 제목 */}
      <div className="mb-6 sm:mb-8">
        <Link
          href={`/insight/category/${encodeURIComponent(category)}`}
          className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
        >
          {category}
        </Link>
      </div>

      {/* 카드 레이아웃: 큰 카드 1개 + 작은 카드 2개 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 큰 카드 (왼쪽) */}
        <div className="lg:col-span-2">
          {mainPost && (
            <PostCard post={mainPost} index={sectionIndex * 3} isLarge={true} />
          )}
        </div>

        {/* 작은 카드들 (오른쪽) */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          {smallPostsToShow.map((post, index) => (
            <SmallPostCard
              key={post.id}
              post={post}
              index={sectionIndex * 3 + index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // 각 카테고리별로 최신 3개 포스트 가져오기
  const categoryPostsMap = await Promise.all(
    categories.map(async (category) => {
      try {
        const posts = await getLatestPostsByCategory(category, 3);
        return { category, posts };
      } catch (error) {
        console.error(`카테고리 "${category}" 포스트 조회 실패:`, error);
        return { category, posts: [] };
      }
    })
  );

  const hasAnyPosts = categoryPostsMap.some(({ posts }) => posts.length > 0);

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
        <GrainOverlay />
        <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {!hasAnyPosts ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {categoryPostsMap.map(({ category, posts }, index) => (
                <CategorySection
                  key={category}
                  category={category}
                  posts={posts}
                  sectionIndex={index}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </SmoothScroll>
  );
}
