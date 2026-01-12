import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * 네이버 검색광고 API Signature 생성
 * 네이버 API는 보안을 위해 HMAC-SHA256 서명을 요구합니다.
 * 공식 문서: https://naver.github.io/searchad-apidoc/#/guides
 * 
 * Signature 형식: HMAC-SHA256({X-Timestamp}.{HTTP 메서드}.{요청 URL 경로}, SECRET_KEY)
 * 예: HMAC-SHA256("1705000000000.GET./keywordstool", SECRET_KEY)
 */
function generateSignature(
  timestamp: string,
  method: string,
  urlPath: string,
  secretKey: string
): string {
  // 공식 문서에 따른 서명 문자열 생성
  // 형식: {X-Timestamp}.{HTTP 메서드}.{요청 URL 경로}
  const message = `${timestamp}.${method}.${urlPath}`;
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64');
  
  console.log('🔐 Signature 생성 (공식 문서 방식):', {
    timestamp,
    method,
    urlPath,
    message,
    signaturePrefix: signature.substring(0, 10) + '...',
  });
  
  return signature;
}

/**
 * 네이버 검색광고 API로 키워드 검색량 조회
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== 네이버 검색광고 API 키워드 검색 시작 ===');
    
    // 환경 변수에서 네이버 API 인증 정보 가져오기
    // 따옴표 제거 (환경 변수에 따옴표가 포함될 수 있음)
    const customerId = process.env.NAVER_CUSTOMER_ID?.trim().replace(/^["']|["']$/g, '');
    const accessLicense = process.env.NAVER_ACCESS_LICENSE?.trim().replace(/^["']|["']$/g, '');
    const secretKey = process.env.NAVER_SECRET_KEY?.trim().replace(/^["']|["']$/g, '');
    
    // 환경 변수 검증
    if (!customerId || !accessLicense || !secretKey) {
      console.error('네이버 API 인증 정보가 설정되지 않았습니다.');
      return NextResponse.json(
        {
          success: false,
          error: '네이버 API 인증 정보가 설정되지 않았습니다. 환경 변수를 확인해주세요.',
          required: {
            NAVER_CUSTOMER_ID: !customerId,
            NAVER_ACCESS_LICENSE: !accessLicense,
            NAVER_SECRET_KEY: !secretKey,
          },
        },
        { status: 500 }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { keyword } = body;
    
    if (!keyword || keyword.trim() === '') {
      console.error('키워드가 제공되지 않았습니다.');
      return NextResponse.json(
        {
          success: false,
          error: '키워드를 입력해주세요.',
        },
        { status: 400 }
      );
    }
    
    console.log('조회할 키워드:', keyword);
    
    // 네이버 검색광고 API 엔드포인트
    // 공식 문서: https://api.searchad.naver.com/keywordstool
    const apiBaseUrl = 'https://api.searchad.naver.com';
    const apiPath = '/keywordstool';
    const apiUrl = `${apiBaseUrl}${apiPath}`;
    
    // HTTP 메서드 (GET 또는 POST - 공식 문서 확인 필요)
    // keywordstool은 일반적으로 GET을 사용하지만, 파라미터가 많으면 POST 사용
    const method = 'GET';
    
    // 타임스탬프 생성 (밀리초)
    const timestamp = Date.now().toString();
    
    // Signature 생성 (공식 문서 방식: timestamp.method.urlPath)
    const signature = generateSignature(timestamp, method, apiPath, secretKey);
    
    // API 요청 파라미터 (GET 방식)
    const params = new URLSearchParams({
      hintKeywords: keyword.trim(),
      showDetail: '1', // 상세 정보 요청
    });
    
    const fullUrl = `${apiUrl}?${params.toString()}`;
    
    console.log('API 요청 정보:', {
      method,
      url: fullUrl,
      path: apiPath,
    });
    console.log('환경 변수 확인:', {
      customerId: customerId ? `${customerId.substring(0, 4)}...` : '없음',
      accessLicense: accessLicense ? `${accessLicense.substring(0, 10)}...` : '없음',
      secretKey: secretKey ? `${secretKey.substring(0, 10)}...` : '없음',
    });
    
    // API 요청 헤더 구성 (공식 문서에 따른 형식)
    const headers = {
      'X-Timestamp': timestamp,
      'X-API-KEY': accessLicense,
      'X-Customer': customerId,
      'X-Signature': signature,
      'Content-Type': 'application/json; charset=UTF-8',
    };
    
    console.log('API 요청 헤더:', {
      'X-Timestamp': timestamp,
      'X-API-KEY': accessLicense.substring(0, 10) + '...',
      'X-Customer': customerId,
      'X-Signature': signature.substring(0, 10) + '...',
    });
    
    try {
      // 네이버 API 호출 (GET 방식)
      const response = await fetch(fullUrl, {
        method: method,
        headers: headers,
      });
        
      console.log('네이버 API 응답 상태:', response.status);
      
      if (response.ok) {
        // 성공한 경우
        const data = await response.json();
        console.log('네이버 API 응답 데이터:', JSON.stringify(data, null, 2));
        
        // 응답 데이터 파싱
        if (!data.keywordList || data.keywordList.length === 0) {
          console.log('검색 결과가 없습니다.');
          return NextResponse.json({
            success: true,
            data: {
              keyword: keyword,
              pcSearchVolume: 0,
              mobileSearchVolume: 0,
              totalSearchVolume: 0,
              message: '검색량이 너무 적거나 데이터가 없습니다.',
            },
          });
        }
        
        // 첫 번째 키워드 데이터 추출
        const keywordData = data.keywordList[0];
        const pcSearchVolume = keywordData.monthlyPcQcCnt || 0;
        const mobileSearchVolume = keywordData.monthlyMobileQcCnt || 0;
        const totalSearchVolume = pcSearchVolume + mobileSearchVolume;
        
        // 경쟁도 변환 (compIdx: HIGH, MEDIUM, LOW 텍스트를 1-10 범위로 변환)
        // HIGH: 높음 (8-10), MEDIUM: 중간 (4-7), LOW: 낮음 (1-3)
        let competition = 1; // 기본값
        let competitionText = '낮음'; // 한글 표시용
        let competitionColor = 'green'; // 색상 (green, orange, red)
        
        if (keywordData.compIdx) {
          const compIdxUpper = String(keywordData.compIdx).toUpperCase();
          if (compIdxUpper === 'HIGH') {
            competition = 9; // 높음: 8-10 범위의 중간값
            competitionText = '높음';
            competitionColor = 'red';
          } else if (compIdxUpper === 'MEDIUM') {
            competition = 5; // 중간: 4-7 범위의 중간값
            competitionText = '중간';
            competitionColor = 'orange';
          } else if (compIdxUpper === 'LOW') {
            competition = 2; // 낮음: 1-3 범위의 중간값
            competitionText = '낮음';
            competitionColor = 'green';
          }
        }
        
        // CPC 추정 (monthlyAvgBid 또는 estimate_avg_bid 사용)
        // 네이버 API에서 제공하는 입찰가 데이터를 CPC로 사용
        let estimatedCpc = 0;
        if (keywordData.monthlyAvgBid !== undefined && keywordData.monthlyAvgBid !== null) {
          estimatedCpc = Math.round(keywordData.monthlyAvgBid);
        } else if (keywordData.estimate_avg_bid !== undefined && keywordData.estimate_avg_bid !== null) {
          estimatedCpc = Math.round(keywordData.estimate_avg_bid);
        }
        
        // 네이버 API 응답의 모든 필드 로깅 (디버깅용)
        console.log('네이버 API 응답 전체 데이터:', JSON.stringify(keywordData, null, 2));
        
        console.log('키워드 검색량 조회 완료:', {
          keyword,
          pcSearchVolume,
          mobileSearchVolume,
          totalSearchVolume,
          compIdx: keywordData.compIdx,
          competition,
          competitionText,
          estimatedCpc,
        });
        
        return NextResponse.json({
          success: true,
          data: {
            keyword: keyword,
            pcSearchVolume,
            mobileSearchVolume,
            totalSearchVolume,
            // 경쟁도 (1-10 범위로 변환)
            competition,
            competitionText, // 한글 텍스트 (높음/중간/낮음)
            competitionColor, // 색상 (red/orange/green)
            // CPC (네이버 API 입찰가 데이터)
            cpc: estimatedCpc,
            // 추가 정보 (있는 경우)
            relKeyword: keywordData.relKeyword,
            monthlyAvePcClkCnt: keywordData.monthlyAvePcClkCnt || 0,
            monthlyAveMobileClkCnt: keywordData.monthlyAveMobileClkCnt || 0,
            plAvgDepth: keywordData.plAvgDepth || 0,
            compIdx: keywordData.compIdx || null,
            monthlyAvgBid: keywordData.monthlyAvgBid || null,
            estimate_avg_bid: keywordData.estimate_avg_bid || null,
            // 원본 데이터 (디버깅용)
            rawData: keywordData,
          },
        });
      } else {
        // 실패한 경우
        const errorText = await response.text();
        console.error('네이버 API 오류:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: fullUrl,
          signatureMessage: `${timestamp}.${method}.${apiPath}`,
        });
        
        // 403 오류인 경우 상세 안내
        if (response.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error: `네이버 API 인증 실패 (403 Forbidden)`,
              details: errorText,
              troubleshooting: [
                '1. 서버 콘솔 로그를 확인하여 Signature 생성 과정을 확인하세요',
                '2. 환경 변수 값이 정확한지 확인하세요 (따옴표 제거 확인)',
                '3. 네이버 검색광고 플랫폼에서 API 사용 권한이 활성화되어 있는지 확인하세요',
                '4. CUSTOMER_ID, ACCESS_LICENSE, SECRET_KEY가 올바른지 확인하세요',
                '5. API 사용 신청이 완료되었는지 확인하세요',
                '6. 서버를 재시작했는지 확인하세요',
                '7. 공식 문서 참고: https://naver.github.io/searchad-apidoc/#/guides',
              ],
              debugInfo: {
                endpoint: apiUrl,
                method,
                path: apiPath,
                timestamp,
                signatureMessage: `${timestamp}.${method}.${apiPath}`,
                signaturePrefix: signature.substring(0, 10) + '...',
              },
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          {
            success: false,
            error: `네이버 API 오류 (${response.status}): ${response.statusText}`,
            details: errorText,
          },
          { status: response.status }
        );
      }
    } catch (fetchError) {
      console.error('네이버 API 호출 오류:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: '네이버 API 호출 중 오류가 발생했습니다.',
          details: fetchError instanceof Error ? fetchError.message : String(fetchError),
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('네이버 검색광고 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '네이버 검색광고 API 호출 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

