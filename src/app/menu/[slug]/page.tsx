import { Metadata } from "next";
import React from "react";
import { getRecipeBySlug, getRecipeContent } from "@/lib/notion-recipe";
import ReactMarkdown from "react-markdown";
import GrainOverlay from "@/components/GrainOverlay";
import FormattedDate from "@/components/FormattedDate";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBaseUrl } from "@/lib/site";
import TagCopySection from "@/components/TagCopySection";
import ClientRecipeContent from "@/components/ClientRecipeContent";

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
  } catch {
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
    alternates: {
      canonical: `/menu/${slug}`,
    },
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

  const baseUrl = getBaseUrl();

  const bodyContent = await getRecipeContent(recipe.id);
  let content = recipe.blogPost || bodyContent;

  // 재료 섹션의 양념, 육수 등을 별도 줄로 분리
  // **양념**: 패턴 앞에 줄바꿈 2개 추가
  if (content.includes("**양념**") || content.includes("**육수**")) {
    content = content
      .replace(/\s+(\*\*양념\*\*:)/g, "\n\n$1")
      .replace(/\s+(\*\*육수\*\*:)/g, "\n\n$1");
  }

  // 재료 섹션의 꺾쇠괄호 형식 (<돼지고기 양념>, <고추잡채 소스>, <곁들임> 등) 앞에 줄바꿈 2개 추가 및 진하게 표시
  // 재료 섹션에서만 적용되도록 조건 추가 (오늘의 재료, 재료 등 키워드가 있는 경우)
  if (
    content.includes("오늘의 재료") ||
    content.includes("재료") ||
    content.includes("**재료**")
  ) {
    // 꺾쇠괄호로 감싸진 패턴을 찾아서 앞의 공백을 줄바꿈 2개로 교체하고, 진하게 표시를 위해 **로 감싸기
    content = content.replace(/\s+(<[^>]+>)/g, "\n\n**$1**");
  }

  // 공지사항 추출 및 본문에서 제거
  let noticeContent = "";

  if (content && content.includes("📢")) {
    const noticePattern = /-{3,}\n+(>?\s*_?📢[\s\S]+?)$/;
    const match = content.match(noticePattern);

    if (match) {
      const rawNotice = match[1];

      noticeContent = rawNotice
        .replace(/\*\*/g, "")
        .replace(/_/g, "")
        .replace(/^>\s*/gm, "")
        .trim();

      if (
        noticeContent &&
        !noticeContent.includes("📢 읽어주셔서 감사합니다!\n")
      ) {
        noticeContent = noticeContent.replace(
          /📢\s*읽어주셔서 감사합니다!/,
          "📢 읽어주셔서 감사합니다!\n",
        );
      }

      content = content.replace(/-{3,}\n+(>?\s*_?📢[\s\S]+?)$/, "").trim();
    }
  }

  // 구조화된 데이터 (JSON-LD) 생성
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.metaDescription || recipe.description,
    url: `${baseUrl}/menu/${recipe.slug}`,
    ...(recipe.featuredImage && {
      image: {
        "@type": "ImageObject",
        url: recipe.featuredImage,
        width: 1200,
        height: 630,
      },
    }),
    datePublished: recipe.date || new Date().toISOString(),
    dateModified: recipe.date || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "박용범",
      email: "decidepyb@gmail.com",
    },
    publisher: {
      "@type": "Person",
      name: "박용범",
      email: "decidepyb@gmail.com",
    },
    ...(recipe.difficulty && { recipeCategory: recipe.difficulty }),
    ...(recipe.cookingTime && { totalTime: `PT${recipe.cookingTime}M` }),
    ...(recipe.servingSize && { recipeYield: `${recipe.servingSize}인분` }),
    inLanguage: "ko-KR",
    recipeCuisine: "한식",
  };

  // BreadcrumbList 구조화된 데이터 (SEO 개선)
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "오늘의 메뉴",
        item: `${baseUrl}/menu`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: recipe.title,
        item: `${baseUrl}/menu/${recipe.slug}`,
      },
    ],
  };

  return (
    <>
      {/* 구조화된 데이터 (JSON-LD) - SEO 최적화 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      {/* BreadcrumbList 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />

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
            </header>

            <ClientRecipeContent title={recipe.title} tags={recipe.tags || []}>
              <div
                className="
              border-l-4 border-teal-500 dark:border-cyan-400
              bg-gradient-to-r from-teal-50/80 via-cyan-50/50 to-sky-50/80
              dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-sky-900/20
              pl-6 pr-6 py-5
              rounded-r-lg
              my-6 sm:my-8
            "
              >
                <p className="text-base sm:text-lg lg:text-xl text-teal-800 dark:text-cyan-200 font-sans leading-relaxed">
                  {recipe.metaDescription}
                </p>
              </div>

              <div className="max-w-none">
                <ReactMarkdown
                  components={{
                    br: () => <br className="my-2" />,
                    p: ({ children, node }) => {
                      const hasImageInNode = node?.children?.some(
                        (child: { type: string; tagName?: string }) =>
                          child.type === "element" && child.tagName === "img",
                      );

                      const checkForImage = (
                        node: React.ReactNode,
                      ): boolean => {
                        if (React.isValidElement(node)) {
                          const element = node as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          if (element.type === "img") {
                            return true;
                          }
                          if (typeof element.type === "function") {
                            const componentType =
                              element.type as React.ComponentType<unknown> & {
                                displayName?: string;
                                name?: string;
                              };
                            const componentName =
                              componentType.displayName || componentType.name;
                            if (componentName === "MarkdownImage") {
                              return true;
                            }
                          }
                          if (element.props?.children) {
                            return React.Children.toArray(
                              element.props.children,
                            ).some(checkForImage);
                          }
                        }
                        if (
                          typeof node !== "string" &&
                          node !== null &&
                          node !== undefined
                        ) {
                          try {
                            return React.Children.toArray(node).some(
                              checkForImage,
                            );
                          } catch {
                            return false;
                          }
                        }
                        return false;
                      };

                      const hasImageInChildren =
                        React.Children.toArray(children).some(checkForImage);

                      if (hasImageInNode || hasImageInChildren) {
                        return (
                          <div className="text-base sm:text-lg text-gray-700 dark:text-white/90 leading-relaxed mb-6">
                            {children}
                          </div>
                        );
                      }

                      const getTextContent = (
                        node: React.ReactNode,
                      ): string => {
                        if (typeof node === "string") {
                          return node;
                        }
                        if (React.isValidElement(node)) {
                          const element = node as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          if (element.props?.children) {
                            return React.Children.toArray(
                              element.props.children,
                            )
                              .map(getTextContent)
                              .join("");
                          }
                        }
                        if (Array.isArray(node)) {
                          return node.map(getTextContent).join("");
                        }
                        return "";
                      };

                      const textContent = getTextContent(children);
                      const isNotice =
                        textContent.includes("📢 읽어주셔서 감사합니다") ||
                        textContent.includes(
                          "지능형 정보 요약 시스템의 도움을 받아",
                        ) ||
                        textContent.includes(
                          "본 포스팅은 방대한 데이터를 신속하게 취합하는",
                        );

                      if (isNotice) {
                        return null;
                      }

                      // 레시피 정보 패턴 감지 (이모지로 시작하는 정보)
                      const isRecipeInfo =
                        textContent.match(/^[🍽️⭐⏱️]/) ||
                        textContent.includes("음식 종류:") ||
                        textContent.includes("난이도:") ||
                        textContent.includes("요리 시간:");

                      // 오늘의 재료 섹션 제목 감지
                      const hasShoppingCartEmoji = textContent.includes("🛒");
                      const hasIngredients =
                        textContent.includes("재료") ||
                        textContent.includes("Ingredients");
                      const hasToday =
                        textContent.includes("오늘") ||
                        textContent.includes("Today");

                      const isIngredientsSectionTitle =
                        (hasShoppingCartEmoji && hasIngredients) ||
                        (hasToday && hasIngredients) ||
                        textContent.includes("오늘의 재료") ||
                        textContent.includes("Today's Ingredients");

                      // 재료 내용 감지: **양념**, **육수** 같은 패턴이 있거나 "고추가루", "국간장" 등이 포함된 경우
                      const hasIngredientsContent =
                        textContent.includes("양념:") ||
                        textContent.includes("육수:") ||
                        (textContent.includes("고추가루") &&
                          textContent.includes("국간장")) ||
                        (textContent.includes("소고기") &&
                          (textContent.includes("고사리") ||
                            textContent.includes("숙주")));

                      // 재료 섹션: 더 큰 글자 크기와 줄바꿈 적용
                      if (isIngredientsSectionTitle || hasIngredientsContent) {
                        // children 배열을 순회하면서 strong 태그 앞뒤에 줄바꿈 추가
                        const childrenArray = React.Children.toArray(children);
                        const processedChildren: React.ReactNode[] = [];
                        let previousWasStrong = false;

                        childrenArray.forEach((child, index) => {
                          // strong 태그인 경우
                          if (
                            React.isValidElement(child) &&
                            child.type === "strong"
                          ) {
                            // 첫 번째가 아니고 이전이 strong이 아니었으면 앞에 줄바꿈 2개 추가
                            if (index > 0 && !previousWasStrong) {
                              processedChildren.push(
                                <br key={`br1-${index}`} />,
                              );
                              processedChildren.push(
                                <br key={`br2-${index}`} />,
                              );
                            }
                            processedChildren.push(child);
                            previousWasStrong = true;
                          } else {
                            processedChildren.push(child);
                            previousWasStrong = false;
                          }
                        });

                        return (
                          <div
                            className="mt-12 mb-8"
                            style={{ marginTop: "2.5rem" }}
                          >
                            <div className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-white/90 leading-relaxed">
                              {processedChildren}
                            </div>
                          </div>
                        );
                      }

                      // 요리 단계 번호 감지 (1., 2., 3. 등으로 시작하는 텍스트)
                      const isCookingStep = /^\d+\./.test(textContent.trim());

                      // 요리 단계는 h3 크기로 표시
                      if (isCookingStep) {
                        return (
                          <p className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mt-6 mb-3">
                            {children}
                          </p>
                        );
                      }

                      return (
                        <p
                          className={`text-base sm:text-lg text-gray-700 dark:text-white/90 leading-relaxed ${
                            isRecipeInfo ? "mb-1" : "mb-6"
                          }`}
                        >
                          {children}
                        </p>
                      );
                    },
                    h1: ({ children }) => {
                      // h1 텍스트 내용 추출
                      const getTextContent = (
                        node: React.ReactNode,
                      ): string => {
                        if (typeof node === "string") return node;
                        if (React.isValidElement(node)) {
                          const element = node as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          if (element.props?.children) {
                            return React.Children.toArray(
                              element.props.children,
                            )
                              .map(getTextContent)
                              .join("");
                          }
                        }
                        if (Array.isArray(node))
                          return node.map(getTextContent).join("");
                        return "";
                      };

                      const textContent = getTextContent(children);

                      // "오늘의 재료" 또는 "요리 가이드" 섹션 감지
                      const hasShoppingCartEmoji = textContent.includes("🛒");
                      const hasCookingEmoji = textContent.includes("🍳");
                      const hasIngredients = textContent.includes("재료");
                      const hasCookingGuide =
                        textContent.includes("가이드") ||
                        textContent.includes("Guide");

                      const isIngredientsSection =
                        (hasShoppingCartEmoji && hasIngredients) ||
                        textContent.includes("오늘의 재료") ||
                        textContent.includes("Today's Ingredients");

                      const isCookingGuideSection =
                        (hasCookingEmoji && hasCookingGuide) ||
                        textContent.includes("요리 가이드") ||
                        textContent.includes("Cooking Guide");

                      // 섹션 타이틀에는 상단 여백 추가
                      if (isIngredientsSection || isCookingGuideSection) {
                        return (
                          <h1 className="font-serif font-bold tracking-tight text-emerald-600 dark:text-emerald-400 text-2xl sm:text-3xl lg:text-4xl mt-16 mb-4">
                            {children}
                          </h1>
                        );
                      }

                      return (
                        <h1 className="font-serif font-bold tracking-tight text-emerald-600 dark:text-emerald-400 text-2xl sm:text-3xl lg:text-4xl mt-8 mb-4">
                          {children}
                        </h1>
                      );
                    },
                    h2: ({ children }) => {
                      // h2 텍스트 내용 추출
                      const getTextContent = (
                        node: React.ReactNode,
                      ): string => {
                        if (typeof node === "string") return node;
                        if (React.isValidElement(node)) {
                          const element = node as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          if (element.props?.children) {
                            return React.Children.toArray(
                              element.props.children,
                            )
                              .map(getTextContent)
                              .join("");
                          }
                        }
                        if (Array.isArray(node))
                          return node.map(getTextContent).join("");
                        return "";
                      };

                      const textContent = getTextContent(children);

                      // "오늘의 재료" 또는 "요리 가이드" 섹션 감지
                      const hasShoppingCartEmoji = textContent.includes("🛒");
                      const hasCookingEmoji = textContent.includes("🍳");
                      const hasIngredients = textContent.includes("재료");
                      const hasCookingGuide =
                        textContent.includes("가이드") ||
                        textContent.includes("Guide");

                      const isIngredientsSection =
                        (hasShoppingCartEmoji && hasIngredients) ||
                        textContent.includes("오늘의 재료") ||
                        textContent.includes("Today's Ingredients");

                      const isCookingGuideSection =
                        (hasCookingEmoji && hasCookingGuide) ||
                        textContent.includes("요리 가이드") ||
                        textContent.includes("Cooking Guide");

                      // 섹션 타이틀에는 상단 여백 추가
                      if (isIngredientsSection || isCookingGuideSection) {
                        return (
                          <h2 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-xl sm:text-2xl lg:text-3xl mt-16 mb-4">
                            {children}
                          </h2>
                        );
                      }

                      return (
                        <h2 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-xl sm:text-2xl lg:text-3xl mt-8 mb-4">
                          {children}
                        </h2>
                      );
                    },
                    h3: ({ children }) => {
                      // h3 텍스트 내용 추출
                      const getTextContent = (
                        node: React.ReactNode,
                      ): string => {
                        if (typeof node === "string") return node;
                        if (React.isValidElement(node)) {
                          const element = node as React.ReactElement<{
                            children?: React.ReactNode;
                          }>;
                          if (element.props?.children) {
                            return React.Children.toArray(
                              element.props.children,
                            )
                              .map(getTextContent)
                              .join("");
                          }
                        }
                        if (Array.isArray(node))
                          return node.map(getTextContent).join("");
                        return "";
                      };

                      const textContent = getTextContent(children);

                      // "오늘의 재료" 또는 "요리 가이드" 섹션 감지
                      const hasShoppingCartEmoji = textContent.includes("🛒");
                      const hasCookingEmoji = textContent.includes("🍳");
                      const hasIngredients = textContent.includes("재료");
                      const hasCookingGuide =
                        textContent.includes("가이드") ||
                        textContent.includes("Guide");

                      const isIngredientsSection =
                        (hasShoppingCartEmoji && hasIngredients) ||
                        textContent.includes("오늘의 재료") ||
                        textContent.includes("Today's Ingredients");

                      const isCookingGuideSection =
                        (hasCookingEmoji && hasCookingGuide) ||
                        textContent.includes("요리 가이드") ||
                        textContent.includes("Cooking Guide");

                      // 섹션 타이틀에는 상단 여백 추가
                      if (isIngredientsSection || isCookingGuideSection) {
                        return (
                          <h3 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mt-16 mb-3">
                            {children}
                          </h3>
                        );
                      }

                      return (
                        <h3 className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mt-6 mb-3">
                          {children}
                        </h3>
                      );
                    },
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
                      <li className="font-serif font-bold tracking-tight text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl mb-3 marker:text-gray-500 dark:marker:text-white/70">
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

                      const srcString =
                        typeof src === "string"
                          ? src
                          : src instanceof Blob
                            ? URL.createObjectURL(src)
                            : String(src);

                      // Determine baseUrl dynamically or from environment
                      const baseUrl =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : process.env.NEXT_PUBLIC_BASE_URL || "";

                      const isExternalImage =
                        srcString.startsWith("http://") ||
                        srcString.startsWith("https://");
                      const proxySrc = isExternalImage
                        ? `${baseUrl}/api/proxy-image?url=${encodeURIComponent(srcString)}`
                        : srcString.startsWith("/")
                          ? `${baseUrl}${srcString}`
                          : srcString;

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
                        </div>
                      );
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </ClientRecipeContent>

            {/* AI 기본법 준수 공지사항은 ClientRecipeContent 외부로 이동 (필요시 내부로 이동 가능) */}
            {noticeContent && (
              <div className="mt-8 sm:mt-12 mb-8 sm:mb-12" aria-hidden="true">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed whitespace-pre-line">
                  {noticeContent}
                </p>
              </div>
            )}
          </article>

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
    </>
  );
}
