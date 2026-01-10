import { Metadata } from "next";
import { getPostBySlug, getPostContent } from "@/lib/notion";
import ReactMarkdown from "react-markdown";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import TextToSpeech from "@/components/TextToSpeech";
import { notFound } from "next/navigation";
import Link from "next/link";

// ISR 설정
export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
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

            <div
              className="prose prose-xl max-w-none 
              prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:!text-2xl prose-p:text-gray-700 dark:prose-p:text-white/90 prose-p:leading-relaxed
              prose-li:!text-2xl prose-ul:!text-2xl prose-ol:!text-2xl
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
              prose-em:text-gray-900 dark:prose-em:text-white/95
              prose-a:text-gray-900 dark:prose-a:text-white prose-a:underline-offset-4 hover:prose-a:text-emerald-600 dark:hover:prose-a:text-white/80
              prose-blockquote:border-l-gray-300 dark:prose-blockquote:border-l-white/20 prose-blockquote:text-gray-600 dark:prose-blockquote:text-white/70
              prose-code:text-gray-900 dark:prose-code:text-white prose-code:bg-gray-100 dark:prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
              prose-ul:text-gray-700 dark:prose-ul:text-white/90 prose-ol:text-gray-700 dark:prose-ol:text-white/90
              prose-li:text-gray-700 dark:prose-li:text-white/90 prose-li:marker:text-gray-500 dark:prose-li:marker:text-white/70
              prose-hr:border-gray-300 dark:prose-hr:border-white/20
            "
            >
              <ReactMarkdown>{content}</ReactMarkdown>
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
