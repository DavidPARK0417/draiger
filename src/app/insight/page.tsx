import { getPublishedPostsPaginated } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Pagination from "@/components/Pagination";
import type { Metadata } from "next";

// ISR 설정: 10초마다 재검증 (더 빠른 업데이트)
export const revalidate = 10;

// 동적 렌더링 강제 (캐시 우회)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '전체 | DRAIGER 인사이트',
  description: '모든 인사이트 포스트를 최신순으로 확인하세요.',
};

interface InsightPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function InsightPage({ searchParams }: InsightPageProps) {
  const params_search = await searchParams;
  const currentPage = parseInt(params_search.page || '1', 10) || 1;

  let paginatedData;
  try {
    paginatedData = await getPublishedPostsPaginated(currentPage, 12);
  } catch (error) {
    console.error("전체 게시글 조회 오류:", error);
    // 에러 발생 시 빈 데이터로 처리하여 페이지가 깨지지 않도록 함
    paginatedData = {
      posts: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const { posts, currentPage: page, totalPages, hasNextPage, hasPrevPage } = paginatedData;

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <header className="mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight font-serif font-bold text-gray-900 dark:text-white">
              전체
            </h1>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-white/50 text-lg">
                게시글이 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(320px,auto)]">
                {posts.map((post, index) => {
                  // Bento Grid 효과: 카드 크기 변형
                  // 각 페이지 내에서도 동일한 패턴 유지
                  const isLarge = index % 4 === 0;
                  const isWide = index % 4 === 2;

                  return (
                    <div
                      key={post.id}
                      className={`
                        ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
                        ${isWide ? "md:col-span-2" : ""}
                      `}
                    >
                      <PostCard post={post} index={index} isLarge={isLarge} />
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/insight"
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

