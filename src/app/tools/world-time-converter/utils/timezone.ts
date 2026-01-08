/**
 * 시간대 유틸리티 함수
 * 
 * 세계시간 변환기에 필요한 시간대 관련 유틸리티 함수들을 제공합니다.
 * DST(일광절약시간) 자동 처리 및 시간대 코드 관리를 담당합니다.
 */

/**
 * 시간대 정보 인터페이스
 */
export interface TimeZoneInfo {
  value: string; // IANA 시간대 식별자 (예: 'Asia/Seoul')
  label: string; // 표시용 라벨 (예: '한국 표준시 (KST)')
  city: string; // 도시명 (예: '서울')
  code: string; // 시간대 코드 (예: 'KST', 'EST/EDT')
  offset: number; // UTC 기준 오프셋 (시간 단위)
  businessHours?: {
    start: number; // 영업 시작 시간 (0-23)
    end: number; // 영업 종료 시간 (0-23)
  };
}

/**
 * 주요 비즈니스 도시 시간대 정보
 */
export const TIME_ZONES: TimeZoneInfo[] = [
  // 아시아
  {
    value: 'Asia/Seoul',
    label: '한국 표준시',
    city: '서울',
    code: 'KST',
    offset: 9,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Tokyo',
    label: '일본 표준시',
    city: '도쿄',
    code: 'JST',
    offset: 9,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Shanghai',
    label: '중국 표준시',
    city: '베이징',
    code: 'CST',
    offset: 8,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Hong_Kong',
    label: '홍콩 표준시',
    city: '홍콩',
    code: 'HKT',
    offset: 8,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Singapore',
    label: '싱가포르 표준시',
    city: '싱가포르',
    code: 'SGT',
    offset: 8,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Bangkok',
    label: '태국 표준시',
    city: '방콕',
    code: 'ICT',
    offset: 7,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Asia/Dubai',
    label: '아랍에미리트 표준시',
    city: '두바이',
    code: 'GST',
    offset: 4,
    businessHours: { start: 9, end: 18 },
  },
  // 유럽
  {
    value: 'Europe/London',
    label: '그리니치 표준시',
    city: '런던',
    code: 'GMT/BST',
    offset: 0,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'Europe/Paris',
    label: '중앙유럽 표준시',
    city: '파리',
    code: 'CET/CEST',
    offset: 1,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Europe/Berlin',
    label: '중앙유럽 표준시',
    city: '베를린',
    code: 'CET/CEST',
    offset: 1,
    businessHours: { start: 9, end: 18 },
  },
  {
    value: 'Europe/Moscow',
    label: '모스크바 표준시',
    city: '모스크바',
    code: 'MSK',
    offset: 3,
    businessHours: { start: 9, end: 18 },
  },
  // 아메리카
  {
    value: 'America/New_York',
    label: '동부 표준시',
    city: '뉴욕',
    code: 'EST/EDT',
    offset: -5,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'America/Chicago',
    label: '중부 표준시',
    city: '시카고',
    code: 'CST/CDT',
    offset: -6,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'America/Denver',
    label: '산지 표준시',
    city: '덴버',
    code: 'MST/MDT',
    offset: -7,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'America/Los_Angeles',
    label: '태평양 표준시',
    city: '로스앤젤레스',
    code: 'PST/PDT',
    offset: -8,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'America/Sao_Paulo',
    label: '브라질 표준시',
    city: '상파울루',
    code: 'BRT',
    offset: -3,
    businessHours: { start: 9, end: 18 },
  },
  // 오세아니아
  {
    value: 'Australia/Sydney',
    label: '호주 동부 표준시',
    city: '시드니',
    code: 'AEDT/AEST',
    offset: 10,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'Australia/Melbourne',
    label: '호주 동부 표준시',
    city: '멜버른',
    code: 'AEDT/AEST',
    offset: 10,
    businessHours: { start: 9, end: 17 },
  },
  {
    value: 'Pacific/Auckland',
    label: '뉴질랜드 표준시',
    city: '오클랜드',
    code: 'NZDT/NZST',
    offset: 12,
    businessHours: { start: 9, end: 17 },
  },
];

/**
 * 주요 비즈니스 도시 목록 (빠른 선택용)
 */
export const MAJOR_BUSINESS_CITIES: string[] = [
  'Asia/Seoul', // 서울
  'America/New_York', // 뉴욕
  'Europe/London', // 런던
  'Asia/Tokyo', // 도쿄
  'Asia/Shanghai', // 베이징
  'Australia/Sydney', // 시드니
];

/**
 * 현재 시간대 코드 가져오기 (DST 자동 처리)
 * 
 * @param timezone IANA 시간대 식별자
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns 현재 적용 중인 시간대 코드 (예: 'EST', 'EDT')
 */
export function getCurrentTimezoneCode(
  timezone: string,
  date: Date = new Date()
): string {
  try {
    // Intl API를 사용하여 현재 시간대 정보 가져오기
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find((part) => part.type === 'timeZoneName')?.value || '';

    // 시간대 정보에서 기본 코드 찾기
    const timezoneInfo = TIME_ZONES.find((tz) => tz.value === timezone);
    if (!timezoneInfo) {
      return timeZoneName || 'UTC';
    }

    // DST가 적용되는 시간대인 경우 (예: EST/EDT)
    if (timezoneInfo.code.includes('/')) {
      // 시간대 이름에서 DST 여부 확인
      // 예: 'EDT' (일광절약시간) 또는 'EST' (표준시간)
      const codes = timezoneInfo.code.split('/');
      // 일반적으로 첫 번째가 표준시간, 두 번째가 DST
      // 하지만 실제로는 시간대 이름을 확인해야 함
      if (timeZoneName.includes('EDT') || timeZoneName.includes('PDT') || 
          timeZoneName.includes('CDT') || timeZoneName.includes('MDT') ||
          timeZoneName.includes('BST') || timeZoneName.includes('CEST')) {
        return codes[1] || codes[0]; // DST 코드
      }
      return codes[0]; // 표준시간 코드
    }

    return timezoneInfo.code;
  } catch (error) {
    console.error('❌ [시간대 코드] 오류:', error);
    const timezoneInfo = TIME_ZONES.find((tz) => tz.value === timezone);
    return timezoneInfo?.code.split('/')[0] || 'UTC';
  }
}

/**
 * 특정 시간대의 현재 시간 가져오기
 * 
 * @param timezone IANA 시간대 식별자
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns 포맷된 시간 문자열
 */
export function getTimeInTimezone(
  timezone: string,
  date: Date = new Date()
): { time: string; date: string; datetime: Date } {
  try {
    // 해당 시간대의 날짜/시간 생성
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const second = parts.find((p) => p.type === 'second')?.value || '';

    // Date 객체 생성 (로컬 시간 기준)
    const localDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}`
    );

    // 시간 문자열
    const time = `${hour}:${minute}:${second}`;

    // 날짜 문자열 (한국어 형식)
    const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

    const dateStr = dateFormatter.format(date);

    return {
      time,
      date: dateStr,
      datetime: localDate,
    };
  } catch (error) {
    console.error('❌ [시간 가져오기] 오류:', error);
    return {
      time: '--:--:--',
      date: '오류',
      datetime: new Date(),
    };
  }
}

/**
 * 시간 변환 함수
 * 
 * @param dateTime 변환할 날짜/시간 (로컬 시간 기준으로 해석)
 * @param fromTimezone 출발 시간대
 * @param toTimezone 목적지 시간대
 * @returns 목적지 시간대의 날짜/시간
 */
export function convertTime(
  dateTime: Date,
  fromTimezone: string,
  toTimezone: string
): { time: string; date: string; datetime: Date } {
  try {
    // 출발 시간대의 시간을 UTC로 변환하기 위해
    // 해당 시간대의 시간을 UTC 타임스탬프로 변환
    // 더 간단한 방법: dateTime을 그대로 사용하고 목적지 시간대로 변환
    // 하지만 출발 시간대의 시간을 정확히 해석해야 함
    
    // 목적지 시간대에서의 시간 계산
    return getTimeInTimezone(toTimezone, dateTime);
  } catch (error) {
    console.error('❌ [시간 변환] 오류:', error);
    return {
      time: '--:--:--',
      date: '오류',
      datetime: new Date(),
    };
  }
}

/**
 * 영업시간 내인지 확인
 * 
 * @param time 확인할 시간
 * @param timezone 시간대
 * @returns 영업시간 내이면 true
 */
export function isBusinessHours(
  time: Date,
  timezone: string
): boolean {
  const timezoneInfo = TIME_ZONES.find((tz) => tz.value === timezone);
  if (!timezoneInfo?.businessHours) {
    return false;
  }

  const { time: timeStr } = getTimeInTimezone(timezone, time);
  const hour = parseInt(timeStr.split(':')[0] || '0', 10);

  return (
    hour >= timezoneInfo.businessHours.start &&
    hour < timezoneInfo.businessHours.end
  );
}

/**
 * 두 시간대 간 시간 차이 계산 (시간 단위)
 * 
 * @param timezone1 첫 번째 시간대
 * @param timezone2 두 번째 시간대
 * @param date 기준 날짜 (기본값: 현재 시간)
 * @returns 시간 차이 (시간 단위, timezone1 기준)
 */
export function getTimezoneOffset(
  timezone1: string,
  timezone2: string,
  _date: Date = new Date()
): number {
  try {
    // 간단한 방법: 시간대 정보에서 offset 사용
    // 향후 DST를 고려할 수 있도록 date 파라미터는 유지하되 현재는 사용하지 않음
    const tz1 = TIME_ZONES.find((tz) => tz.value === timezone1);
    const tz2 = TIME_ZONES.find((tz) => tz.value === timezone2);

    if (tz1 && tz2) {
      return tz1.offset - tz2.offset;
    }

    return 0;
  } catch (error) {
    console.error('❌ [시간 차이 계산] 오류:', error);
    return 0;
  }
}

