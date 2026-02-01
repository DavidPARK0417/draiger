import { NextRequest, NextResponse } from 'next/server';

/**
 * 이미지 프록시 API
 * 외부 이미지를 서버 측에서 가져와서 클라이언트에 전달하여 CORS 문제를 우회합니다
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 URL이 필요합니다' },
        { status: 400 }
      );
    }

    // URL 검증
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
    } catch {
      decodedUrl = imageUrl;
    }

    // 허용된 도메인 확인 (보안)
    const allowedDomains = [
      'thumbnews.nateimg.co.kr',
      'news.nateimg.co.kr',
      'notion.so',
      's3.us-west-2.amazonaws.com',
    ];

    const urlObj = new URL(decodedUrl);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed && process.env.NODE_ENV === 'development') {
      console.warn(`[proxy-image] 허용되지 않은 도메인: ${urlObj.hostname}`);
      // 보안상 엄격하게 하지 않고, 경고만 출력하고 진행
      // 필요시 return NextResponse.json({ error: '허용되지 않은 도메인' }, { status: 403 });
    }

    // 외부 이미지 가져오기
    if (process.env.NODE_ENV === 'development') {
      console.log(`[proxy-image] 이미지 가져오기 시도: ${decodedUrl.substring(0, 100)}...`);
    }
    
    // Referer를 이미지가 있는 원본 사이트로 설정
    let referer = 'https://news.nate.com/';
    if (decodedUrl.includes('thumbnews.nateimg.co.kr') || decodedUrl.includes('news.nateimg.co.kr')) {
      referer = 'https://news.nate.com/';
    }
    
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': referer,
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      // redirect를 따라가도록 설정
      redirect: 'follow',
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[proxy-image] 응답 상태: ${imageResponse.status} ${imageResponse.statusText}`);
      console.log(`[proxy-image] Content-Type: ${imageResponse.headers.get('content-type')}`);
      console.log(`[proxy-image] Content-Length: ${imageResponse.headers.get('content-length')}`);
    }

    if (!imageResponse.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[proxy-image] 이미지 가져오기 실패: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      return NextResponse.json(
        { error: `이미지를 가져올 수 없습니다: ${imageResponse.status}` },
        { status: imageResponse.status }
      );
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // 이미지를 클라이언트에 전달
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24시간 캐시
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[proxy-image] 오류:', error);
    }
    return NextResponse.json(
      { error: '이미지 프록시 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

