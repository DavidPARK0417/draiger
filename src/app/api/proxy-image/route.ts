import { NextRequest, NextResponse } from "next/server";

/**
 * 이미지 프록시 API
 * 외부 이미지를 서버 측에서 가져와서 클라이언트에 전달하여 CORS 문제를 우회합니다
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다" },
        { status: 400 },
      );
    }

    // searchParams.get()은 이미 한 번 디코딩된 값을 반환합니다.
    // 여기서 다시 decodeURIComponent를 호출하면 S3 서명된 URL의 특수문자(예: %2F -> /)가
    // 중복 디코딩되어 서명 불일치(400 Bad Request)가 발생할 수 있습니다.
    const decodedUrl = imageUrl;

    // 허용된 도메인 확인 (보안)
    const allowedDomains = [
      "thumbnews.nateimg.co.kr",
      "news.nateimg.co.kr",
      "notion.so",
      "s3.us-west-2.amazonaws.com",
      "amazonaws.com",
      "i.ibb.co", // 추가
    ];

    const urlObj = new URL(decodedUrl);
    const isAllowed = allowedDomains.some(
      (domain) =>
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`),
    );

    if (!isAllowed && process.env.NODE_ENV === "development") {
      console.warn(`[proxy-image] 허용되지 않은 도메인: ${urlObj.hostname}`);
    }

    // 외부 이미지 가져오기
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[proxy-image] 이미지 가져오기 시도: ${decodedUrl.substring(0, 100)}...`,
      );
    }

    // Referer 설정 최적화
    const isNate = decodedUrl.includes("nateimg.co.kr");
    const isNotionS3 =
      decodedUrl.includes("amazonaws.com") || decodedUrl.includes("notion.so");

    let referer = "";
    if (isNate) {
      referer = "https://news.nate.com/";
    } else if (isNotionS3) {
      // Notion/S3는 보통 Referer가 없거나 자신의 도메인이어야 함
      referer = "https://www.notion.so/";
    }

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    if (referer) {
      headers["Referer"] = referer;
    }

    const imageResponse = await fetch(decodedUrl, {
      headers,
      redirect: "follow",
    });

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[proxy-image] 응답 상태: ${imageResponse.status} ${imageResponse.statusText}`,
      );
      console.log(
        `[proxy-image] Content-Type: ${imageResponse.headers.get("content-type")}`,
      );
      console.log(
        `[proxy-image] Content-Length: ${imageResponse.headers.get("content-length")}`,
      );
    }

    if (!imageResponse.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[proxy-image] 이미지 가져오기 실패: ${imageResponse.status} ${imageResponse.statusText}`,
        );
      }
      return NextResponse.json(
        { error: `이미지를 가져올 수 없습니다: ${imageResponse.status}` },
        { status: imageResponse.status },
      );
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/png";

    // 이미지를 클라이언트에 전달
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24시간 캐시
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[proxy-image] 오류:", error);
    }
    return NextResponse.json(
      { error: "이미지 프록시 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
