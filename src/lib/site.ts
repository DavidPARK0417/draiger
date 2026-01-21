/**
 * 사이트 URL 관련 유틸리티 함수
 * Vercel 환경에서는 자동으로 올바른 도메인을 감지합니다.
 */

/**
 * 현재 사이트의 기본 URL을 반환합니다.
 * 우선순위:
 * 1. NEXT_PUBLIC_SITE_URL 환경 변수
 * 2. VERCEL_URL 환경 변수 (Vercel 배포 환경)
 * 3. 기본값: https://draiger.vercel.app
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'https://draiger.vercel.app';
}

