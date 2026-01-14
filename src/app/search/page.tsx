import Link from "next/link";
import { getPublishedPosts, Post } from "@/lib/notion";
import { Search } from "lucide-react";
import Pagination from "@/components/Pagination";

const marketingTools = [
  { name: "광고 성과 계산", href: "/tools/ad-performance" },
  { name: "키워드 분석", href: "/tools/keyword-analysis" },
  { name: "ROI 계산기", href: "/tools/roi-calculator" },
  { name: "손익분기점 계산기", href: "/tools/break-even-point" },
  { name: "광고 예산 계산기", href: "/tools/budget-calculator" },
  { name: "CRO 계산기", href: "/tools/conversion-calculator" },
  { name: "수익성 진단", href: "/tools/profitability-diagnosis" },
];

const usefulTools = [
  { name: "이미지크기 조정", href: "/tools/image-resize" },
  { name: "파비콘 생성기", href: "/tools/favicon-generator" },
  { name: "QR코드 생성기", href: "/tools/qr-code-generator" },
  { name: "URL 단축", href: "/tools/url-shortener" },
  { name: "글자수 세기", href: "/tools/character-counter" },
  { name: "세계시간 변환기", href: "/tools/world-time-converter" },
  { name: "알람시계", href: "/tools/alarm-clock" },
  { name: "파일 미리보기", href: "/tools/file-preview" },
  { name: "이자 계산기", href: "/tools/interest-calculator" },
];

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

interface SearchResult {
  type: "insight" | "tool";
  title: string;
  description?: string;
  href: string;
  category?: string;
}

// 검색 함수
function searchContent(query: string, posts: Post[]): SearchResult[] {
  const results: SearchResult[] = [];
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return results;

  // 검색어를 단어 단위로 분리 (공백으로 구분)
  const queryWords = lowerQuery.split(/\s+/).filter((word) => word.length > 0);

  // 인사이트 글 검색
  const insightResults = posts
    .filter((post) => {
      const lowerTitle = post.title.toLowerCase();
      const lowerDescription = post.metaDescription?.toLowerCase() || "";
      const lowerContent = post.blogPost?.toLowerCase() || "";
      const lowerCategory = post.category?.toLowerCase() || "";

      // 전체 검색어로 검색 (기존 방식)
      const fullQueryMatch =
        lowerTitle.includes(lowerQuery) ||
        lowerDescription.includes(lowerQuery) ||
        lowerContent.includes(lowerQuery) ||
        lowerCategory.includes(lowerQuery);

      // 단어 단위로 검색 (OR 검색: 검색어의 단어 중 하나라도 포함되면 매치)
      const wordMatch = queryWords.some((word) => {
        return (
          lowerTitle.includes(word) ||
          lowerDescription.includes(word) ||
          lowerContent.includes(word) ||
          lowerCategory.includes(word)
        );
      });

      // 제목에 대해서는 더 유연한 검색: 검색어의 각 단어가 제목에 포함되는지 확인
      const titleWordMatch = queryWords.every((word) =>
        lowerTitle.includes(word)
      );

      return fullQueryMatch || wordMatch || titleWordMatch;
    })
    .map((post) => ({
      type: "insight" as const,
      title: post.title,
      description: post.metaDescription,
      href: `/insight/${post.slug}`,
      category: post.category,
    }));

  results.push(...insightResults);

  // 도구 검색 (단어 단위 검색 추가)
  const allTools = [...marketingTools, ...usefulTools];
  const toolResults = allTools
    .filter((tool) => {
      const lowerName = tool.name.toLowerCase();
      // 전체 검색어로 검색
      const fullMatch = lowerName.includes(lowerQuery);
      // 단어 단위로 검색
      const wordMatch = queryWords.some((word) => lowerName.includes(word));
      return fullMatch || wordMatch;
    })
    .map((tool) => ({
      type: "tool" as const,
      title: tool.name,
      href: tool.href,
    }));

  results.push(...toolResults);

  return results;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const searchType = params.type || "all"; // all, insight, tool
  const currentPage = parseInt(params.page || "1", 10) || 1;
  const pageSize = 10; // 페이지당 결과 수

  // 인사이트 글 가져오기
  let allPosts: Post[] = [];
  try {
    allPosts = await getPublishedPosts();
    console.log("검색: 인사이트 글 가져오기 완료, 총", allPosts.length, "개");
  } catch (error) {
    console.error("검색: 인사이트 글 가져오기 오류:", error);
  }

  // 검색 실행
  const allResults = searchContent(query, allPosts);
  console.log("검색 결과:", allResults.length, "개");

  // 타입별 필터링
  const filteredResults =
    searchType === "all"
      ? allResults
      : searchType === "insight"
      ? allResults.filter((r) => r.type === "insight")
      : allResults.filter((r) => r.type === "tool");

  // 페이지네이션 계산
  const totalResults = filteredResults.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  const insightResults = paginatedResults.filter((r) => r.type === "insight");
  const toolResults = paginatedResults.filter((r) => r.type === "tool");

  // 전체 결과 수 (필터링 전)
  const allInsightResults = filteredResults.filter((r) => r.type === "insight");
  const allToolResults = filteredResults.filter((r) => r.type === "tool");

  // 페이지네이션 URL 생성
  const baseSearchUrl = `/search?q=${encodeURIComponent(query)}${
    searchType !== "all" ? `&type=${searchType}` : ""
  }`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            검색 결과
          </h1>
          {query && (
            <p className="text-gray-600 dark:text-gray-400">
              &quot;
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {query}
              </span>
              &quot;에 대한 검색 결과
            </p>
          )}
        </header>

        {/* 검색 타입 필터 */}
        {query && (
          <div className="mb-6 flex gap-2 flex-wrap">
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=all`}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-300
                ${
                  searchType === "all"
                    ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700"
                }
              `}
            >
              전체 ({totalResults})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=insight`}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-300
                ${
                  searchType === "insight"
                    ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700"
                }
              `}
            >
              인사이트 ({allInsightResults.length})
            </Link>
            <Link
              href={`/search?q=${encodeURIComponent(query)}&type=tool`}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-300
                ${
                  searchType === "tool"
                    ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700"
                }
              `}
            >
              도구 ({allToolResults.length})
            </Link>
          </div>
        )}

        {/* 검색 결과 */}
        {!query ? (
          <div className="text-center py-20">
            <Search
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              검색어를 입력해주세요.
            </p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20">
            <Search
              size={48}
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              검색 결과가 없습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 결과 통계 */}
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              총 {totalResults}개의 결과 중 {startIndex + 1}-
              {Math.min(endIndex, totalResults)}개 표시
            </div>

            <div className="space-y-8">
              {/* 인사이트 결과 */}
              {(searchType === "all" || searchType === "insight") &&
                insightResults.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      인사이트 글 ({allInsightResults.length})
                    </h2>
                    <div className="space-y-4">
                      {insightResults.map((result, index) => (
                        <Link
                          key={`${result.href}-${index}`}
                          href={result.href}
                          className="
                          block p-6 rounded-2xl
                          bg-white dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          shadow-md hover:shadow-xl
                          dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70
                          transition-all duration-300
                          hover:-translate-y-1
                        "
                        >
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {result.title}
                          </h3>
                          {result.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          {result.category && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                              {result.category}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* 도구 결과 */}
              {(searchType === "all" || searchType === "tool") &&
                toolResults.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      도구 ({allToolResults.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {toolResults.map((result, index) => (
                        <Link
                          key={`${result.href}-${index}`}
                          href={result.href}
                          className="
                          block p-6 rounded-2xl
                          bg-white dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          shadow-md hover:shadow-xl
                          dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70
                          transition-all duration-300
                          hover:-translate-y-1
                          text-center
                        "
                        >
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            {result.title}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <Pagination
                currentPage={validPage}
                totalPages={totalPages}
                baseUrl={baseSearchUrl}
                hasNextPage={validPage < totalPages}
                hasPrevPage={validPage > 1}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
