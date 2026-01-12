import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    console.log("🗜️ [이미지 압축 API] 요청 수신");

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      console.error("❌ [이미지 압축 API] 이미지 파일 없음");
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    const mode = formData.get("mode") as string; // "auto" | "manual"
    const quality = formData.get("quality") as string; // 1-100 (수동 모드에서만 사용)

    // 이미지 버퍼로 변환
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 원본 이미지 메타데이터 가져오기
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format || "jpeg";
    const originalSize = buffer.length;

    console.log("📐 [이미지 압축 API] 원본 정보", {
      format,
      originalSize,
      width: metadata.width,
      height: metadata.height,
    });

    let compressedBuffer: Buffer;
    let finalQuality: number;

    if (mode === "auto") {
      // 자동 모드: 품질 손실 최소화하며 압축
      // 형식별로 최적의 품질 설정
      if (format === "jpeg" || format === "jpg") {
        // JPG: 85% 품질로 시작하여 점진적으로 압축
        finalQuality = 85;
        compressedBuffer = await sharp(buffer)
          .jpeg({ quality: finalQuality, mozjpeg: true })
          .toBuffer();
        
        // 목표: 원본의 70% 이하 크기로 압축 (단, 품질은 80 이상 유지)
        let attempts = 0;
        while (compressedBuffer.length > originalSize * 0.7 && finalQuality >= 80 && attempts < 3) {
          finalQuality -= 5;
          compressedBuffer = await sharp(buffer)
            .jpeg({ quality: finalQuality, mozjpeg: true })
            .toBuffer();
          attempts++;
        }
      } else if (format === "png") {
        // PNG: 압축 레벨 9 (최대 압축)
        compressedBuffer = await sharp(buffer)
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .toBuffer();
        finalQuality = 90; // PNG는 품질 개념이 없으므로 표시용
      } else if (format === "webp") {
        // WebP: 85% 품질
        finalQuality = 85;
        compressedBuffer = await sharp(buffer)
          .webp({ quality: finalQuality })
          .toBuffer();
      } else if (format === "gif") {
        // GIF: 압축 최적화
        compressedBuffer = await sharp(buffer)
          .gif({ dither: 0.5 })
          .toBuffer();
        finalQuality = 90; // GIF는 품질 개념이 없으므로 표시용
      } else {
        // 기타 형식: 원본 반환
        compressedBuffer = buffer;
        finalQuality = 100;
      }
    } else {
      // 수동 모드: 사용자가 지정한 품질로 압축
      finalQuality = parseInt(quality || "80", 10);
      finalQuality = Math.max(1, Math.min(100, finalQuality)); // 1-100 범위로 제한

      if (format === "jpeg" || format === "jpg") {
        compressedBuffer = await sharp(buffer)
          .jpeg({ quality: finalQuality, mozjpeg: true })
          .toBuffer();
      } else if (format === "png") {
        // PNG 품질을 압축 레벨로 변환 (9가 최대 압축)
        const compressionLevel = Math.round((100 - finalQuality) / 11.11); // 0-9 범위
        compressedBuffer = await sharp(buffer)
          .png({ compressionLevel, adaptiveFiltering: true })
          .toBuffer();
      } else if (format === "webp") {
        compressedBuffer = await sharp(buffer)
          .webp({ quality: finalQuality })
          .toBuffer();
      } else if (format === "gif") {
        // GIF는 품질 조정이 제한적이므로 원본 반환
        compressedBuffer = buffer;
      } else {
        // 기타 형식: 원본 반환
        compressedBuffer = buffer;
      }
    }

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    console.log("✅ [이미지 압축 API] 처리 완료", {
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      quality: finalQuality,
    });

    // MIME 타입 결정
    const mimeType =
      format === "jpeg" || format === "jpg"
        ? "image/jpeg"
        : format === "png"
        ? "image/png"
        : format === "webp"
        ? "image/webp"
        : format === "gif"
        ? "image/gif"
        : `image/${format}`;

    // 응답에 메타데이터 포함
    return new NextResponse(new Uint8Array(compressedBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="compressed_image.${format}"`,
        "X-Original-Size": originalSize.toString(),
        "X-Compressed-Size": compressedSize.toString(),
        "X-Compression-Ratio": compressionRatio,
        "X-Quality": finalQuality.toString(),
      },
    });
  } catch (error) {
    console.error("❌ [이미지 압축 API] 오류:", error);
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

