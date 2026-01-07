import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    console.log("🖼️ [이미지 리사이즈 API] 요청 수신");

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      console.error("❌ [이미지 리사이즈 API] 이미지 파일 없음");
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const mode = formData.get("mode") as string;
    const option = formData.get("option") as string;
    const maintainAspectRatio = formData.get("maintainAspectRatio") === "true";
    const dontEnlarge = formData.get("dontEnlarge") === "true";

    // 이미지 버퍼로 변환
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 원본 이미지 메타데이터 가져오기
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    console.log("📐 [이미지 리사이즈 API] 원본 크기", {
      width: originalWidth,
      height: originalHeight,
    });

    let targetWidth: number | null = null;
    let targetHeight: number | null = null;

    // 리사이즈 옵션에 따라 크기 계산
    if (mode === "pixel") {
      const widthInput = formData.get("width") as string;
      const heightInput = formData.get("height") as string;

      const requestedWidth = widthInput ? parseInt(widthInput, 10) : 0;
      const requestedHeight = heightInput ? parseInt(heightInput, 10) : 0;

      if (option === "max") {
        // 최대 크기로 조정 (비율 유지)
        if (requestedWidth > 0 && requestedHeight > 0) {
          // 둘 다 지정된 경우, 더 작은 비율로 조정
          const widthRatio = requestedWidth / originalWidth;
          const heightRatio = requestedHeight / originalHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          if (dontEnlarge && ratio > 1) {
            // 확대하지 않음 옵션이 있고 확대가 필요한 경우
            targetWidth = originalWidth;
            targetHeight = originalHeight;
          } else {
            targetWidth = Math.round(originalWidth * ratio);
            targetHeight = Math.round(originalHeight * ratio);
          }
        } else if (requestedWidth > 0) {
          // 너비만 지정
          if (dontEnlarge && requestedWidth > originalWidth) {
            targetWidth = originalWidth;
            targetHeight = originalHeight;
          } else {
            targetWidth = requestedWidth;
            targetHeight = maintainAspectRatio
              ? Math.round((originalHeight * requestedWidth) / originalWidth)
              : originalHeight;
          }
        } else if (requestedHeight > 0) {
          // 높이만 지정
          if (dontEnlarge && requestedHeight > originalHeight) {
            targetWidth = originalWidth;
            targetHeight = originalHeight;
          } else {
            targetHeight = requestedHeight;
            targetWidth = maintainAspectRatio
              ? Math.round((originalWidth * requestedHeight) / originalHeight)
              : originalWidth;
          }
        } else {
          return NextResponse.json(
            { error: "너비 또는 높이를 입력해주세요." },
            { status: 400 }
          );
        }
      } else {
        // 정확한 크기
        targetWidth = requestedWidth > 0 ? requestedWidth : originalWidth;
        targetHeight = requestedHeight > 0 ? requestedHeight : originalHeight;

        if (maintainAspectRatio) {
          // 비율 유지하면서 최대한 맞춤
          const widthRatio = targetWidth / originalWidth;
          const heightRatio = targetHeight / originalHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          if (dontEnlarge && ratio > 1) {
            targetWidth = originalWidth;
            targetHeight = originalHeight;
          } else {
            targetWidth = Math.round(originalWidth * ratio);
            targetHeight = Math.round(originalHeight * ratio);
          }
        }
      }
    } else {
      // 퍼센트 모드
      const percentInput = formData.get("percent") as string;
      const percent = parseFloat(percentInput || "100");

      if (percent <= 0) {
        return NextResponse.json(
          { error: "올바른 퍼센트 값을 입력해주세요." },
          { status: 400 }
        );
      }

      const ratio = percent / 100;
      targetWidth = Math.round(originalWidth * ratio);
      targetHeight = Math.round(originalHeight * ratio);
    }

    if (!targetWidth || !targetHeight) {
      return NextResponse.json(
        { error: "크기 계산 중 오류가 발생했습니다." },
        { status: 400 }
      );
    }

    console.log("📐 [이미지 리사이즈 API] 목표 크기", {
      width: targetWidth,
      height: targetHeight,
    });

    // 이미지 리사이즈
    const resizedBuffer = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: maintainAspectRatio ? "inside" : "fill",
        withoutEnlargement: dontEnlarge,
      })
      .toBuffer();

    console.log("✅ [이미지 리사이즈 API] 처리 완료", {
      originalSize: buffer.length,
      resizedSize: resizedBuffer.length,
    });

    // 이미지 형식 유지 (원본 형식으로 반환)
    const format = metadata.format || "jpeg";
    const mimeType = format === "jpeg" ? "image/jpeg" : `image/${format}`;

    return new NextResponse(resizedBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="resized_image.${format}"`,
      },
    });
  } catch (error) {
    console.error("❌ [이미지 리사이즈 API] 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "이미지 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

