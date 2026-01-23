import { Metadata } from "next";
import React from "react";
import { getRecipeBySlug, getRecipeContent } from "@/lib/notion-recipe";
import ReactMarkdown from "react-markdown";
import GrainOverlay from "@/components/GrainOverlay";
import TextToSpeech from "@/components/TextToSpeech";
import FormattedDate from "@/components/FormattedDate";
import AdFit from "@/components/AdFit";
import GiscusComments from "@/components/GiscusComments";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 60;
export const dynamicParams = true;

interface MenuPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    // 모든 레시피를 가져와서 slug 생성
    // 간단하게 빈 배열 반환 (동적 생성으로 대체)
    return [];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: MenuPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return { title: "Recipe Not Found" };
  }

  return {
    title: `${recipe.title} | DRAIGER 오늘의메뉴`,
    description: recipe.metaDescription,
    openGraph: {
      title: recipe.title,
      description: recipe.metaDescription,
      type: "article",
    },
  };
}

export default async function MenuPostPage({ params }: MenuPostPageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const bodyContent = await getRecipeContent(recipe.id);
  let content = recipe.blogPost || bodyContent;
  
  // 공지사항 추출 및 본문에서 제거
  let noticeContent = '';
  
  if (content && content.includes('📢')) {
    const noticePattern = /-{3,}\n+(>?\s*_?📢[\s\S]+?)$/;
    const match = content.match(noticePattern);
    
    if (match) {
      const rawNotice = match[1];
      
      noticeContent = rawNotice
        .replace(/\*\*/g, '')
        .replace(/_/g, '')
        .replace(/^>\s*/gm, '')
        .trim();
      
      if (noticeContent && !noticeContent.includes('📢 읽어주셔서 감사합니다!\n')) {
        noticeContent = noticeContent.replace(/📢\s*읽어주셔서 감사합니다!/,  '📢 읽어주셔서 감사합니다!\n');
      }
      
      content = content
        .replace(/-{3,}\n+(>?\s*_?📢[\s\S]+?)$/, '')
        .trim();
    }
  }

  return (
    <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <GrainOverlay />
      <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <article>
          <header className="mb-12 sm:mb-16">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-6 sm:mb-8 leading-tight text-gray-900 dark:text-white">
              {recipe.title}
            </h1>
            {recipe.date && (
              <div className="mb-4 sm:mb-6">
                <FormattedDate
                  date={recipe.date}
                  className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-sans"
                />
              </div>
            )}
            <p className="text-base sm:text-lg text-gray-600 dark:text-white/50 font-sans italic leading-relaxed">
              {recipe.metaDescription}
            </p>
          </header>

          {/* 카카오 애드핏 광고 */}
          <div className="mb-8 sm:mb-12 flex justify-center">
            <AdFit
              unitId="DAN-3zxEkFXjkDNH2T9G"
              width={300}
              height={250}
              className="w-full max-w-[300px]"
            />
          </div>

          {/* 음성 읽기 컴포넌트 */}
          <TextToSpeech 
            content={content} 
            title={recipe.title} 
            metaDescription={recipe.metaDescription}
          />

          <div className="max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children, node }) => {
                  const hasImageInNode = node?.children?.some(
                    (child: { type: string; tagName?: string }) =>
                      child.type === 'element' && child.tagName === 'img'
                  );

                  const checkForImage = (node: React.ReactNode): boolean => {
                    if (React.isValidElement(node)) {
                      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                      if (element.type === 'img') {
                        return true;
                      }
                      if (typeof element.type === 'function') {
                        const componentType = element.type as React.ComponentType<unknown> & { displayName?: string; name?: string };
                        const componentName = componentType.displayName || componentType.name;
                        if (componentName === 'MarkdownImage') {
                          return true;
                        }
                      }
                      if (element.props?.children) {
                        return React.Children.toArray(element.props.children).some(checkForImage);
                      }
                    }
                    if (typeof node !== 'string' && node !== null && node !== undefined) {
                      try {
                        return React.Children.toArray(node).some(checkForImage);
                      } catch {
                        return false;
                      }
                    }
                    return false;
                  };

                  const hasImageInChildren = React.Children.toArray(children).some(checkForImage);

                  if (hasImageInNode || hasImageInChildren) {
                    return (
                      <div className="text-base sm:text-lg text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                        {children}
                      </div>
                    );
                  }

                  const getTextContent = (node: React.ReactNode): string => {
                    if (typeof node === 'string') {
                      return node;
                    }
                    if (React.isValidElement(node)) {
                      const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                      if (element.props?.children) {
                        return React.Children.toArray(element.props.children)
                          .map(getTextContent)
                          .join('');
                      }
                    }
                    if (Array.isArray(node)) {
                      return node.map(getTextContent).join('');
                    }
                    return '';
                  };

                  const textContent = getTextContent(children);
                  const isNotice = 
                    textContent.includes('📢 읽어주셔서 감사합니다') ||
                    textContent.includes('지능형 정보 요약 시스템의 도움을 받아') ||
                    textContent.includes('본 포스팅은 방대한 데이터를 신속하게 취합하는');

                  if (isNotice) {
                    return null;
                  }

                  return (
                    <p className="text-base sm:text-lg text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                      {children}
                    </p>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-2xl sm:text-3xl lg:text-4xl mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-xl sm:text-2xl lg:text-3xl mt-8 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mt-6 mb-3">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-base sm:text-lg lg:text-xl mt-6 mb-3">
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
                  <ul className="text-base sm:text-lg text-gray-700 dark:text-white/90 mb-6 pl-6 list-disc">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-base sm:text-lg text-gray-700 dark:text-white/90 mb-6 pl-6 list-decimal">
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
                img: ({ src, alt, ...props }) => {
                  if (!src) return null;
                  
                  const srcString = typeof src === 'string' ? src : src instanceof Blob ? URL.createObjectURL(src) : String(src);
                  
                  const isExternalImage = srcString.startsWith('http://') || srcString.startsWith('https://');
                  const proxySrc = isExternalImage ? `/api/proxy-image?url=${encodeURIComponent(srcString)}` : srcString;
                  
                  return (
                    <div className="my-8 sm:my-10 lg:my-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proxySrc}
                        alt={alt || "이미지"}
                        className="w-full h-auto rounded-lg shadow-sm dark:shadow-gray-900/30 object-contain bg-gray-100 dark:bg-gray-800"
                        loading="lazy"
                        {...props}
                      />
                      {alt && (
                        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400 italic">
                          {alt}
                        </p>
                      )}
                    </div>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 dark:border-white/10">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {recipe.tags.map((tag, index) => (
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

          {/* AI 기본법 준수 공지사항 */}
          {noticeContent && (
            <div className="mt-8 sm:mt-12 mb-8 sm:mb-12" aria-hidden="true">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed whitespace-pre-line">
                {noticeContent}
              </p>
            </div>
          )}
        </article>

        {/* 댓글 섹션 */}
        <GiscusComments slug={slug} />

        <footer className="mt-24 sm:mt-32 pt-12 sm:pt-16 border-t border-gray-200 dark:border-white/10">
          <Link
            href="/menu"
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
            Back to Menu
          </Link>
        </footer>
      </main>
    </div>
  );
}

