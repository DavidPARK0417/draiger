import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/notion";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log(`[post-category API] slug로 카테고리 조회 시작: ${slug}`);

    const post = await getPostBySlug(slug);

    if (!post) {
      console.log(`[post-category API] 포스트를 찾을 수 없음: ${slug}`);
      return NextResponse.json(
        { category: null },
        { status: 404 }
      );
    }

    console.log(`[post-category API] 포스트 카테고리 조회 성공: ${post.category || '없음'}`);
    return NextResponse.json({
      category: post.category || null,
    });
  } catch (error) {
    console.error("[post-category API] 카테고리 조회 오류:", error);
    return NextResponse.json(
      { category: null },
      { status: 500 }
    );
  }
}

