import { getPublishedPostsByCategoryPaginated } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Pagination from "@/components/Pagination";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ISR 설정: 60초마다 재검증
export const revalidate = 60;

const categories = [
  "정치",
  "경제",
  "주식",
  "사회",
  "AI 신기술",
  "생활 문화",
  "세계",
  "스포츠",
];

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return {
    title: `${decodedCategory} | DRAIGER Blog`,
    description: `${decodedCategory} 카테고리 블로그 포스트`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const params_search = await searchParams;
  const currentPage = parseInt(params_search.page || '1', 10) || 1;

  // 유효한 카테고리인지 확인
  if (!categories.includes(decodedCategory)) {
    notFound();
  }

  let paginatedData;
  try {
    paginatedData = await getPublishedPostsByCategoryPaginated(decodedCategory, currentPage, 12);
  } catch (error) {
    console.error("카테고리별 게시글 조회 오류:", error);
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
      <div className="blog-page min-h-screen bg-[#F8F9FA] dark:bg-[#0d0d0d]">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <header className="mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-tighter uppercase font-serif text-gray-900 dark:text-white">
              {decodedCategory}
            </h1>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-white/50 text-lg">
                {decodedCategory} 카테고리에 게시글이 없습니다.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[300px]">
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
                      <PostCard post={post} index={index} />
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl={`/blog/category/${encodeURIComponent(decodedCategory)}`}
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

