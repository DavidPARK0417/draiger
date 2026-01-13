import { NextResponse } from "next/server";
import { getTotalPostsCount, getTotalPostsCountByCategory } from "@/lib/notion";

// Header에서 사용하는 카테고리 목록
const categories = [
  "내일의 AI",
  "돈이 되는 소식",
  "궁금한 세상 이야기",
  "슬기로운 생활",
  "오늘보다 건강하게",
  "마음 채우기",
  "기타",
];

export async function GET() {
  try {
    console.log("카테고리별 게시글 개수 조회 시작");

    // 전체 게시글 개수 가져오기
    const totalCount = await getTotalPostsCount();
    console.log("전체 게시글 개수:", totalCount);

    // 각 카테고리별 개수 가져오기
    const categoryCounts: Record<string, number> = {};
    
    // 병렬로 모든 카테고리 개수 조회
    const countPromises = categories.map(async (category) => {
      try {
        const count = await getTotalPostsCountByCategory(category);
        console.log(`${category} 카테고리 개수:`, count);
        return { category, count };
      } catch (error) {
        console.error(`${category} 카테고리 개수 조회 오류:`, error);
        return { category, count: 0 };
      }
    });

    const results = await Promise.all(countPromises);
    
    // 결과를 객체로 변환
    results.forEach(({ category, count }) => {
      categoryCounts[category] = count;
    });

    return NextResponse.json({
      total: totalCount,
      categories: categoryCounts,
    });
  } catch (error) {
    console.error("카테고리별 게시글 개수 조회 오류:", error);
    
    // 에러 발생 시 빈 객체 반환 (헤더가 깨지지 않도록)
    return NextResponse.json(
      {
        total: 0,
        categories: categories.reduce((acc, cat) => {
          acc[cat] = 0;
          return acc;
        }, {} as Record<string, number>),
      },
      { status: 500 }
    );
  }
}

