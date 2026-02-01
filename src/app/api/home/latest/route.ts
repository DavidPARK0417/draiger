import { NextResponse } from "next/server";
import { getLatestPosts } from "@/lib/notion";
import { getLatestRecipes } from "@/lib/notion-recipe";

// 동적 렌더링 강제 (항상 최신 데이터 가져오기)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [recipes, posts] = await Promise.all([
      getLatestRecipes(3).catch(() => []),
      getLatestPosts(3).catch(() => []),
    ]);

    return NextResponse.json({
      recipes,
      posts,
    });
  } catch (error) {
    console.error("홈 페이지 데이터 조회 오류:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      {
        recipes: [],
        posts: [],
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

