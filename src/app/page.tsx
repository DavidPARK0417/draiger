import { getPublishedPosts } from "@/lib/notion";
import PostCard from "@/components/PostCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
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

export default async function Home() {
  const posts = await getPublishedPosts();

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[300px]">
            {posts.map((post, index) => {
              // Bento Grid 효과: 카드 크기 변형
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
        </main>
      </div>
    </SmoothScroll>
  );
}
