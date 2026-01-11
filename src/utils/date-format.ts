/**
 * 날짜를 YYYYMMDDHHmmss 형식의 문자열로 변환합니다.
 * 예: 2026-01-11 19:31:05 → "20260111193105"
 * 
 * @param date - 변환할 Date 객체 (기본값: 현재 시간)
 * @returns YYYYMMDDHHmmss 형식의 문자열
 */
export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

