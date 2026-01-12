import { Metadata } from "next";
import { getPostBySlug, getPostContent, getPublishedPosts } from "@/lib/notion";
import ReactMarkdown from "react-markdown";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import TextToSpeech from "@/components/TextToSpeech";
import { notFound } from "next/navigation";
import Link from "next/link";

// ISR 설정: 10초마다 재검증 (더 빠른 업데이트)
export const revalidate = 10;

// 동적 렌더링 강제 (캐시 우회)
export const dynamic = 'force-dynamic';

// 동적 라우트 설정: 새로운 slug가 추가되면 자동으로 생성
export const dynamicParams = true;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// 빌드 시점에 모든 블로그 포스트 slug를 생성
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    console.log(`[generateStaticParams] 총 ${posts.length}개의 블로그 포스트 slug 생성`);
    
    return posts
      .filter((post) => post.slug) // slug가 있는 포스트만 필터링
      .map((post) => ({
        slug: post.slug,
      }));
  } catch (error) {
    console.error("[generateStaticParams] 블로그 포스트 slug 생성 실패:", error);
    // 에러 발생 시 빈 배열 반환 (동적 생성으로 대체)
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | DRAIGER Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Notion 페이지 콘텐츠를 마크다운으로 변환
  const bodyContent = await getPostContent(post.id);
  const content = post.blogPost || bodyContent;

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen bg-[#F8F9FA] dark:bg-[#0d0d0d]">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <article>
            <header className="mb-12 sm:mb-16">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-6 sm:mb-8 leading-tight text-gray-900 dark:text-white">
                {post.title}
              </h1>
              {post.date && (
                <div className="mb-4 sm:mb-6">
                  <time className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-sans">
                    {new Date(post.date).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Seoul", // 한국 시간대 명시적 지정
                    })}
                  </time>
                </div>
              )}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-white/50 font-sans italic leading-relaxed">
                {post.metaDescription}
              </p>
            </header>

            {/* 음성 읽기 컴포넌트 */}
            <TextToSpeech 
              content={content} 
              title={post.title} 
              metaDescription={post.metaDescription}
            />

            <div className="max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-[18px] text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="font-serif font-normal tracking-tight text-gray-900 dark:text-white text-4xl mt-8 mb-4">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-3xl mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-2xl mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-xl mt-6 mb-3">
                      {children}
                    </h4>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gray-900 dark:text-white font-semibold">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-gray-900 dark:text-white/95 italic">
                      {children}
                    </em>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-gray-900 dark:text-white underline underline-offset-4 hover:text-emerald-600 dark:hover:text-white/80"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-2xl text-gray-700 dark:text-white/90 mb-6 pl-6 list-disc">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-2xl text-gray-700 dark:text-white/90 mb-6 pl-6 list-decimal">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700 dark:text-white/90 mb-2 marker:text-gray-500 dark:marker:text-white/70">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-white/20 pl-6 italic text-gray-600 dark:text-white/70 my-6">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children }) => (
                    <code className="text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-1 rounded">
                      {children}
                    </code>
                  ),
                  hr: () => (
                    <hr className="border-gray-300 dark:border-white/20 my-8" />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 dark:border-white/10">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="
                        inline-flex items-center
                        px-3 py-1.5 sm:px-4 sm:py-2
                        rounded-full
                        text-xs sm:text-sm
                        font-medium
                        bg-emerald-50 dark:bg-emerald-900/30
                        text-emerald-700 dark:text-emerald-300
                        border border-emerald-200 dark:border-emerald-700/50
                        transition-colors duration-300
                      "
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <footer className="mt-24 sm:mt-32 pt-12 sm:pt-16 border-t border-gray-200 dark:border-white/10">
            <Link
              href="/"
              className="group flex items-center gap-4 text-sm uppercase tracking-widest text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-white/10 flex items-center justify-center group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:border-gray-900 dark:group-hover:border-white transition-colors duration-500">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="group-hover:stroke-white dark:group-hover:stroke-black stroke-gray-900 dark:stroke-white transition-colors duration-500 rotate-180"
                >
                  <path
                    d="M1 11L11 1M11 1H1M11 1V11"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              Back to Index
            </Link>
          </footer>
        </main>
      </div>
    </SmoothScroll>
  );
}
