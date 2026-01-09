import { getPublishedPostsPaginated } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Pagination from "@/components/Pagination";
import type { Metadata } from 'next';

// ISR 설정: 60초마다 재검증
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Journal | DRAIGER',
  description: 'A minimal, interactive blog powered by Notion and Next.js.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Journal | DRAIGER',
    description: 'A minimal, interactive blog powered by Notion and Next.js.',
    url: '/',
  },
};

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10) || 1;
  
  const { posts, currentPage: page, totalPages, hasNextPage, hasPrevPage } = 
    await getPublishedPostsPaginated(currentPage, 12);

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen">
        <GrainOverlay />
        <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8">

          <header className="mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-tighter uppercase font-serif text-white">
              Journal
            </h1>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">
                게시글이 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[300px]">
                {posts.map((post, index) => {
                  // Bento Grid 효과: 카드 크기 변형
                  // 각 페이지 내에서도 동일한 패턴 유지
                  const isLarge = index % 4 === 0;  // 4번째마다 큰 카드
                  const isWide = index % 4 === 2;    // 2번째마다 넓은 카드

                  return (
                    <div
                      key={post.id}
                      className={`
                        ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
                        ${isWide ? "md:col-span-2" : ""}
                      `}
                    >
                      <PostCard post={post} index={index} />
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/"
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
              />
            </>
          )}
        </main>
      </div>
    </SmoothScroll>
  );
}
