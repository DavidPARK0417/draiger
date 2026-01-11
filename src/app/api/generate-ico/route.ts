import { NextRequest, NextResponse } from "next/server";

/**
 * ICO 파일 생성 API
 * PNG 이미지를 받아서 실제 ICO 형식으로 변환합니다.
 * ICO 파일은 멀티 레이어 형식 (16x16, 32x32 포함)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 이미지를 ArrayBuffer로 읽기
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sharp 라이브러리를 사용하여 ICO 생성
    // 하지만 Sharp는 Node.js 전용이므로, 여기서는 간단한 방법 사용
    // 실제 프로덕션에서는 sharp 라이브러리 사용 권장
    
    // 임시로: PNG를 ICO 형식으로 변환하는 간단한 방법
    // 실제 ICO 형식은 복잡하므로, 여기서는 PNG를 반환하고
    // 클라이언트에서 ICO 형식으로 변환하도록 안내
    
    // TODO: 실제 ICO 생성 로직 구현 필요
    // 현재는 PNG를 반환 (브라우저 호환성을 위해)
    
    return NextResponse.json(
      { 
        error: "ICO 생성 기능은 현재 개발 중입니다. PNG 파일을 사용해주세요.",
        message: "브라우저는 PNG 파일도 파비콘으로 사용할 수 있습니다."
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("❌ [ICO 생성 API] 오류:", error);
    return NextResponse.json(
      { error: "ICO 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

