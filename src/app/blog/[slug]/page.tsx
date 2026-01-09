import { Metadata } from "next";
import { getPostBySlug, getPostContent } from "@/lib/notion";
import ReactMarkdown from "react-markdown";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
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
      <div className="blog-page min-h-screen">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <article>
            <header className="mb-12 sm:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-serif mb-6 sm:mb-8 leading-tight text-white">
                {post.title}
              </h1>
              <p className="text-lg sm:text-xl text-white/50 font-sans leading-relaxed">
                {post.metaDescription}
              </p>
            </header>

            <div
              className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-white
              prose-p:text-white/90 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-em:text-white/95
              prose-a:text-white prose-a:underline-offset-4 hover:prose-a:text-white/80
              prose-blockquote:border-l-white/20 prose-blockquote:text-white/70
              prose-code:text-white prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
              prose-ul:text-white/90 prose-ol:text-white/90
              prose-li:text-white/90 prose-li:marker:text-white/70
              prose-hr:border-white/20
            "
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </article>

          <footer className="mt-24 sm:mt-32 pt-12 sm:pt-16 border-t border-white/10">
            <Link
              href="/"
              className="group flex items-center gap-4 text-sm uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-colors duration-500">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="group-hover:stroke-black stroke-white transition-colors duration-500 rotate-180"
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

