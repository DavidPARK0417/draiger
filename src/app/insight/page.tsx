import { Suspense } from "react";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Pagination from "@/components/Pagination";
import InsightSearch from "@/components/InsightSearch";
import { getPublishedPostsPaginated, searchPosts } from "@/lib/notion";

// ISR 설정 (60초마다 갱신)
export const revalidate = 60;

async function InsightPageContent({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const page = parseInt(searchParams.page || "1", 10) || 1;
  const query = searchParams.q || "";

  let data;
  try {
    if (query) {
      data = await searchPosts(query, page, 12);
    } else {
      data = await getPublishedPostsPaginated(page, 12);
    }
  } catch (error) {
    console.error("인사이트 글 조회 오류:", error);
    data = {
      posts: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const posts = data.posts || [];
  const totalCount = data.totalCount || 0;
  const totalPages = data.totalPages || 0;
  const hasNextPage = data.hasNextPage || false;
  const hasPrevPage = data.hasPrevPage || false;

  return (
    <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <GrainOverlay />
      <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <header className="mb-12 sm:mb-16 lg:mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight font-serif font-bold text-gray-900 dark:text-white">
              전체
            </h1>

            {/* 검색 컴포넌트 (클라이언트) */}
            <InsightSearch />
          </div>

          {query && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              검색 결과: &quot;{query}&quot; ({posts.length}개)
            </p>
          )}
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 dark:text-white/50 text-lg mb-4">
              {query ? "검색 결과가 없습니다." : "게시글이 없습니다."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(320px,auto)]">
              {posts.map((post, index) => {
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
              baseUrl={
                query ? `/insight?q=${encodeURIComponent(query)}` : "/insight"
              }
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default async function InsightPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <SmoothScroll>
      <Suspense
        fallback={
          <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
            <GrainOverlay />
            <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center py-20">
                <p className="text-gray-600 dark:text-white/50 text-lg">
                  로딩 중...
                </p>
              </div>
            </main>
          </div>
        }
      >
        <InsightPageContent searchParams={resolvedParams} />
      </Suspense>
    </SmoothScroll>
  );
}
