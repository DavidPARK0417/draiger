import { Metadata } from "next";
import React from "react";
import { getPostBySlug, getPostContent, getPublishedPosts } from "@/lib/notion";
import ReactMarkdown from "react-markdown";
import GrainOverlay from "@/components/GrainOverlay";
import TextToSpeech from "@/components/TextToSpeech";
import FormattedDate from "@/components/FormattedDate";
import AdFit from "@/components/AdFit";
import GiscusComments from "@/components/GiscusComments";
import { notFound } from "next/navigation";
import Link from "next/link";

// ISR 설정: 60초마다 재검증 (더 빠른 업데이트를 원하면 30초로 조정 가능)
export const revalidate = 60;

// 동적 라우트 설정: 새로운 slug가 추가되면 자동으로 생성
export const dynamicParams = true;

interface InsightPostPageProps {
  params: Promise<{ slug: string }>;
}

// 빌드 시점에 모든 인사이트 포스트 slug를 생성
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    if (process.env.NODE_ENV === 'development') {
      console.log(`[generateStaticParams] 총 ${posts.length}개의 인사이트 포스트 slug 생성`);
    }
    
    return posts
      .filter((post) => post.slug) // slug가 있는 포스트만 필터링
      .map((post) => ({
        slug: post.slug,
      }));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[generateStaticParams] 인사이트 포스트 slug 생성 실패:", error);
    }
    // 에러 발생 시 빈 배열 반환 (동적 생성으로 대체)
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: InsightPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | DRAIGER 인사이트`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
    },
  };
}

export default async function InsightPostPage({ params }: InsightPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Notion 페이지 콘텐츠를 마크다운으로 변환
  const bodyContent = await getPostContent(post.id);
  let content = post.blogPost || bodyContent;
  
  // 공지사항 추출 및 본문에서 제거
  let noticeContent = '';
  
  // 📢로 시작하는 공지사항 찾기 (---  구분선 이후)
  if (content && content.includes('📢')) {
    // --- 구분선 이후에 나오는 > _📢로 시작하는 공지사항 매칭
    // \n---\n 이후 > _📢로 시작하고, 문서 끝까지 또는 다음 섹션까지
    const noticePattern = /-{3,}\n+(>?\s*_?📢[\s\S]+?)$/;
    const match = content.match(noticePattern);
    
    if (match) {
      // 공지사항 원본 추출 (match[1]이 공지사항 내용)
      const rawNotice = match[1];
      
      // 마크다운 형식 제거 (**, _, >, 등)
      noticeContent = rawNotice
        .replace(/\*\*/g, '')  // 볼드 제거
        .replace(/_/g, '')      // 이탤릭 제거
        .replace(/^>\s*/gm, '') // 인용문 제거
        .trim();
      
      // "📢 읽어주셔서 감사합니다! " 다음에 줄바꿈 추가
      if (noticeContent && !noticeContent.includes('📢 읽어주셔서 감사합니다!\n')) {
        noticeContent = noticeContent.replace(/📢\s*읽어주셔서 감사합니다!/,  '📢 읽어주셔서 감사합니다!\n');
      }
      
      // 본문에서 공지사항과 구분선 완전히 제거
      // --- 구분선부터 문서 끝까지 제거
      content = content
        .replace(/-{3,}\n+(>?\s*_?📢[\s\S]+?)$/, '')  // 구분선 + 공지사항 제거
        .trim();
    }
  }
  
  // 디버깅: 마크다운 콘텐츠에 이미지가 포함되어 있는지 확인 (개발 환경에서만)
  if (content && process.env.NODE_ENV === 'development') {
    // 다양한 이미지 형식 확인
    const markdownImagePattern = /!\[.*?\]\([^\)]+\)/gi;
    const htmlImagePattern = /<img[^>]+src=["'][^"']+["'][^>]*>/gi;
    const notionImagePattern = /https:\/\/[^\s\)]+\.(png|jpg|jpeg|gif|webp|svg)/gi;
    
    const markdownImages = content.match(markdownImagePattern) || [];
    const htmlImages = content.match(htmlImagePattern) || [];
    const urlImages = content.match(notionImagePattern) || [];
    
    console.log('[InsightPostPage] 마크다운 콘텐츠 분석:');
    console.log('- 마크다운 이미지 형식:', markdownImages.length, '개');
    console.log('- HTML 이미지 태그:', htmlImages.length, '개');
    console.log('- URL 이미지:', urlImages.length, '개');
    
    if (markdownImages.length > 0) {
      console.log('[InsightPostPage] 마크다운 이미지:', markdownImages.slice(0, 3));
    }
    if (htmlImages.length > 0) {
      console.log('[InsightPostPage] HTML 이미지:', htmlImages.slice(0, 3));
    }
    if (urlImages.length > 0) {
      console.log('[InsightPostPage] URL 이미지:', urlImages.slice(0, 3));
    }
    
    // 마크다운 콘텐츠의 일부를 출력 (이미지 부분 확인)
    const imageSection = content.match(/.{0,200}(!\[.*?\]\([^\)]+\)|<img[^>]+>).{0,200}/i);
    if (imageSection) {
      console.log('[InsightPostPage] 이미지 포함 섹션:', imageSection[0]);
    }
    
    // 이미지 파일명만 있는 경우 확인
    const imageFilenameOnly = content.match(/news_1756856273_1543672_m_1\.png/);
    if (imageFilenameOnly) {
      console.log('[InsightPostPage] ⚠️ 이미지 파일명만 발견 (URL 없음):', imageFilenameOnly[0]);
      const filenameIndex = content.indexOf(imageFilenameOnly[0]);
      const context = content.substring(
        Math.max(0, filenameIndex - 100),
        Math.min(content.length, filenameIndex + imageFilenameOnly[0].length + 100)
      );
      console.log('[InsightPostPage] 파일명 주변 컨텍스트:', context);
    }
  }

  return (
    <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
      <GrainOverlay />
      <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <article>
            <header className="mb-12 sm:mb-16">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-6 sm:mb-8 leading-tight text-gray-900 dark:text-white">
                {post.title}
              </h1>
              {post.date && (
                <div className="mb-4 sm:mb-6">
                  <FormattedDate
                    date={post.date}
                    className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-sans"
                  />
                </div>
              )}
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/50 font-sans italic leading-relaxed">
                {post.metaDescription}
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
              title={post.title} 
              metaDescription={post.metaDescription}
            />

            <div className="max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children, node }) => {
                    // ReactMarkdown의 AST 노드를 확인하여 이미지가 있는지 체크
                    // node.children을 확인하여 더 정확하게 이미지 감지
                    const hasImageInNode = node?.children?.some(
                      (child: { type: string; tagName?: string }) =>
                        child.type === 'element' && child.tagName === 'img'
                    );

                    // 자식에 이미지가 있는지 확인하는 함수 (더 정확한 감지)
                    const checkForImage = (node: React.ReactNode): boolean => {
                      if (React.isValidElement(node)) {
                        const element = node as React.ReactElement<{ children?: React.ReactNode }>;
                        // img 태그 직접 확인
                        if (element.type === 'img') {
                          return true;
                        }
                        // MarkdownImage 컴포넌트 확인
                        if (typeof element.type === 'function') {
                          const componentType = element.type as React.ComponentType<unknown> & { displayName?: string; name?: string };
                          const componentName = componentType.displayName || componentType.name;
                          if (componentName === 'MarkdownImage') {
                            return true;
                          }
                        }
                        // 자식 요소 재귀적으로 확인
                        if (element.props?.children) {
                          return React.Children.toArray(element.props.children).some(checkForImage);
                        }
                      }
                      // 문자열이 아닌 경우에만 재귀 확인
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

                    // 이미지가 있으면 div로 렌더링 (p 안에 div가 들어갈 수 없음)
                    if (hasImageInNode || hasImageInChildren) {
                      return (
                        <div className="text-base sm:text-lg text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                          {children}
                        </div>
                      );
                    }

                    // 공지사항 패턴 감지 (AI 기본법 준수 공지사항)
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

                    // 공지사항인 경우 본문에서 제거 (태그 아래에 별도로 렌더링)
                    if (isNotice) {
                      return null;
                    }

                    // 일반 텍스트는 p로 렌더링
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
                    // 단순 img 태그로 렌더링 (MarkdownImage 복잡도 제거)
                    if (!src) return null;
                    
                    // src를 문자열로 변환 (Blob인 경우 처리)
                    const srcString = typeof src === 'string' ? src : src instanceof Blob ? URL.createObjectURL(src) : String(src);
                    
                    // 외부 이미지는 프록시 사용
                    const isExternalImage = srcString.startsWith('http://') || srcString.startsWith('https://');
                    const proxySrc = isExternalImage ? `/api/proxy-image?url=${encodeURIComponent(srcString)}` : srcString;
                    
                    return (
                      <div className="my-8 sm:my-10 lg:my-12">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proxySrc}
                          alt={alt || "이미지"}
                          className="w-full h-auto rounded-xl sm:rounded-2xl shadow-lg dark:shadow-gray-900/50 object-contain bg-gray-100 dark:bg-gray-800"
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
                  // 텍스트 노드에서 이미지 파일명을 감지하여 처리
                  text: ({ children }) => {
                    const textContent = String(children);
                    // 이미지 파일명 패턴 감지
                    const imageFilenamePattern = /^([a-zA-Z0-9_-]+\.(png|jpg|jpeg|gif|webp|svg))$/;
                    const match = textContent.trim().match(imageFilenamePattern);
                    
                    if (match && process.env.NODE_ENV === 'development') {
                      const filename = match[1];
                      console.log('[ReactMarkdown text] ⚠️ 이미지 파일명만 있는 텍스트 발견:', filename);
                      // 이미지 파일명만 있는 경우, 나중에 처리하기 위해 그대로 반환
                      // (마크다운 변환 단계에서 이미 처리되어야 함)
                    }
                    
                    return <>{children}</>;
                  },
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

            {/* AI 기본법 준수 공지사항 - 태그 아래에 표시 */}
            {noticeContent && (
              <div className="mt-8 sm:mt-12 mb-8 sm:mb-12">
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
  );
}

