import { NextRequest, NextResponse } from "next/server";
import { searchRecipes } from "@/lib/notion-recipe";

// 동적 렌더링 강제 (searchParams 사용으로 인해 정적 렌더링 불가)
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;

    if (!query.trim()) {
      return NextResponse.json(
        {
          recipes: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          error: "검색어를 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const paginatedData = await searchRecipes(query, page, 12);

    return NextResponse.json(paginatedData);
  } catch (error) {
    console.error("레시피 검색 오류:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 환경 변수 관련 에러인 경우 더 명확한 메시지 반환
    if (errorMessage.includes("NOTION_RECIPE") || errorMessage.includes("not defined")) {
      return NextResponse.json(
        {
          recipes: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
          error: "환경 변수가 설정되지 않았습니다. NOTION_RECIPE_API_KEY와 NOTION_RECIPE_DATABASE_ID를 확인해주세요.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        recipes: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

