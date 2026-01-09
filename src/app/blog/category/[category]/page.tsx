import { getPublishedPostsByCategory } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  // 유효한 카테고리인지 확인
  if (!categories.includes(decodedCategory)) {
    notFound();
  }

  let posts;
  try {
    posts = await getPublishedPostsByCategory(decodedCategory);
  } catch (error) {
    console.error("카테고리별 게시글 조회 오류:", error);
    // 에러 발생 시 빈 배열로 처리하여 페이지가 깨지지 않도록 함
    posts = [];
  }

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <header className="mb-12 sm:mb-16 lg:mb-20">
            <h1 className="text-[12vw] sm:text-[10vw] lg:text-[8vw] leading-[0.9] tracking-tighter uppercase font-serif text-white">
              {decodedCategory}
            </h1>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg">
                {decodedCategory} 카테고리에 게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[300px]">
              {posts.map((post, index) => {
                // Bento Grid 효과: 카드 크기 변형
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
          )}
        </main>
      </div>
    </SmoothScroll>
  );
}

