/**
 * 사이트 URL 관련 유틸리티 함수
 * Vercel 환경에서는 자동으로 올바른 도메인을 감지합니다.
 */

/**
 * 현재 사이트의 기본 URL을 반환합니다.
 * 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL 환경 변수
 * 2. VERCEL_URL 환경 변수 (프로덕션 환경일 때만, draiger.vercel.app 포함 확인)
 * 3. 기본값: https://draiger.vercel.app
 * 
 * 주의: 프리뷰 배포에서는 임시 URL이 생성되므로 프로덕션 환경에서만 VERCEL_URL을 사용합니다.
 */
export function getBaseUrl(): string {
  // 1. 명시적으로 설정된 환경 변수가 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 2. Vercel 프로덕션 환경에서만 VERCEL_URL 사용
  // 프리뷰 배포에서는 임시 URL이 생성되므로 프로덕션일 때만 사용
  if (process.env.VERCEL_URL && process.env.VERCEL_ENV === 'production') {
    const vercelUrl = process.env.VERCEL_URL;
    // draiger.vercel.app을 포함하는 경우에만 사용 (프로덕션 도메인 확인)
    if (vercelUrl.includes('draiger.vercel.app')) {
      return `https://${vercelUrl}`;
    }
  }
  
  // 3. 기본값: 프로덕션 도메인
  return 'https://draiger.vercel.app';
}

