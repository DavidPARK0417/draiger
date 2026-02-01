import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts, Post } from "@/lib/notion";
import { getAllPublishedRecipes, Recipe } from "@/lib/notion-recipe";

// 동적 렌더링 강제
export const dynamic = 'force-dynamic';
export const revalidate = 60;

const marketingTools = [
  { name: "광고 성과 계산", href: "/tools/ad-performance" },
  { name: "ROI 계산기", href: "/tools/roi-calculator" },
  { name: "키워드 분석", href: "/tools/keyword-analysis" },
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

interface SearchResult {
  type: "insight" | "tool" | "menu";
  title: string;
  description?: string;
  href: string;
  category?: string;
  date?: string;
}

// 검색 함수
function searchContent(query: string, posts: Post[], recipes: Recipe[]): SearchResult[] {
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

      // 전체 검색어로 검색
      const fullQueryMatch =
        lowerTitle.includes(lowerQuery) ||
        lowerDescription.includes(lowerQuery) ||
        lowerContent.includes(lowerQuery) ||
        lowerCategory.includes(lowerQuery);

      // 단어 단위로 검색 (OR 검색)
      const wordMatch = queryWords.some((word) => {
        return (
          lowerTitle.includes(word) ||
          lowerDescription.includes(word) ||
          lowerContent.includes(word) ||
          lowerCategory.includes(word)
        );
      });

      // 제목에 대해서는 더 유연한 검색
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
      date: post.date,
    }));

  results.push(...insightResults);

  // 도구 검색
  const allTools = [...marketingTools, ...usefulTools];
  const toolResults = allTools
    .filter((tool) => {
      const lowerName = tool.name.toLowerCase();
      const fullMatch = lowerName.includes(lowerQuery);
      const wordMatch = queryWords.some((word) => lowerName.includes(word));
      return fullMatch || wordMatch;
    })
    .map((tool) => ({
      type: "tool" as const,
      title: tool.name,
      href: tool.href,
    }));

  results.push(...toolResults);

  // 메뉴(레시피) 검색
  const menuResults = recipes
    .filter((recipe) => {
      const lowerTitle = recipe.title.toLowerCase();
      const lowerDescription = recipe.metaDescription?.toLowerCase() || "";
      const lowerContent = recipe.blogPost?.toLowerCase() || "";
      const lowerCategory = recipe.category?.toLowerCase() || "";
      const lowerTags = (recipe.tags || []).join(" ").toLowerCase();

      // 전체 검색어로 검색
      const fullQueryMatch =
        lowerTitle.includes(lowerQuery) ||
        lowerDescription.includes(lowerQuery) ||
        lowerContent.includes(lowerQuery) ||
        lowerCategory.includes(lowerQuery) ||
        lowerTags.includes(lowerQuery);

      // 단어 단위로 검색
      const wordMatch = queryWords.some((word) => {
        return (
          lowerTitle.includes(word) ||
          lowerDescription.includes(word) ||
          lowerContent.includes(word) ||
          lowerCategory.includes(word) ||
          lowerTags.includes(word)
        );
      });

      // 제목에 대해서는 더 유연한 검색
      const titleWordMatch = queryWords.every((word) =>
        lowerTitle.includes(word)
      );

      return fullQueryMatch || wordMatch || titleWordMatch;
    })
    .map((recipe) => ({
      type: "menu" as const,
      title: recipe.title,
      description: recipe.metaDescription,
      href: `/menu/${recipe.slug}`,
      category: recipe.category,
      date: recipe.date,
    }));

  results.push(...menuResults);

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    // 인사이트 글 가져오기
    let allPosts: Post[] = [];
    try {
      allPosts = await getPublishedPosts();
    } catch (error) {
      console.error("검색: 인사이트 글 가져오기 오류:", error);
    }

    // 메뉴(레시피) 가져오기
    let allRecipes: Recipe[] = [];
    try {
      allRecipes = await getAllPublishedRecipes();
    } catch (error) {
      console.error("검색: 메뉴 가져오기 오류:", error);
    }

    // 검색 실행
    const allResults = searchContent(query, allPosts, allRecipes);

    // 결과 제한
    const limitedResults = allResults.slice(0, limit);

    return NextResponse.json({
      results: limitedResults,
      total: allResults.length,
    });
  } catch (error) {
    console.error("검색 API 오류:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        results: [],
        total: 0,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

