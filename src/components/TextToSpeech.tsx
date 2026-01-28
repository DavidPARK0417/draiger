'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, Gauge, X } from 'lucide-react';

interface TextToSpeechProps {
  content: string;
  title: string;
  metaDescription?: string;
}

export default function TextToSpeech({ content, title, metaDescription }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState(3.0); // 기본 속도 3.0 (3배속) - 빠른 읽기
  const [showFullPanel, setShowFullPanel] = useState(false); // 전체 패널 표시 여부
  const speechRateRef = useRef(speechRate); // 최신 속도 값을 항상 참조하기 위한 ref (초기값을 state와 동기화)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const textPartsRef = useRef<string[]>([]); // 텍스트 부분들을 저장 (문장 단위)
  const wordPartsRef = useRef<string[]>([]); // 단어 단위로 나눈 텍스트 (속도 변경 시 사용)
  const pauseAfterRef = useRef<boolean[]>([]); // 각 문장 뒤에 일시정지가 있는지 표시
  const currentIndexRef = useRef(0); // 다음에 재생할 인덱스
  const currentPlayingIndexRef = useRef(0); // 현재 재생 중인 부분의 인덱스
  const currentWordIndexRef = useRef(0); // 현재 재생 중인 단어의 인덱스 (속도 변경 시 사용)
  const timeoutIdsRef = useRef<number[]>([]); // setTimeout ID들을 저장 (속도 변경 시 취소 가능)
  const playNextPartRef = useRef<(() => void) | null>(null); // playNextPart 함수 참조
  const isRateChangingRef = useRef(false); // 속도 변경 중 플래그 (중복 재생 방지)
  
  // 정확한 위치 추적을 위한 ref 추가
  const currentCharIndexRef = useRef(0); // 현재 재생 중인 문자 위치
  const currentSentenceStartCharIndexRef = useRef(0); // 현재 문장의 시작 문자 위치
  const isBoundarySupportedRef = useRef(false); // onboundary 이벤트 지원 여부

  useEffect(() => {
    // 브라우저 지원 여부 확인
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // 보이스 목록이 로드될 때까지 대기 (Chrome/Edge에서 필요)
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (process.env.NODE_ENV === 'development') {
          console.log('사용 가능한 보이스:', voices.map(v => ({ name: v.name, lang: v.lang })));
        }
      };
      
      // 보이스 목록 로드 이벤트 리스너
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // 즉시 한 번 실행 (이미 로드된 경우)
      loadVoices();
    }

    // 컴포넌트 언마운트 시 음성 중지
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // 속도 변경 시 ref 업데이트 (실시간 반영을 위해)
  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  // 브라우저 호환성 확인 (onboundary 이벤트 지원 여부)
  useEffect(() => {
    try {
      const testUtterance = new SpeechSynthesisUtterance('test');
      isBoundarySupportedRef.current = 'onboundary' in testUtterance;
      if (process.env.NODE_ENV === 'development') {
        console.log('onboundary 이벤트 지원:', isBoundarySupportedRef.current);
      }
    } catch {
      isBoundarySupportedRef.current = false;
    }
  }, []);

  // 속도에 따른 pitch 조절 함수 (자연스러운 읽기를 위해)
  const getPitchForRate = (rate: number): number => {
    // 낮은 속도(0.5~1.0)에서는 pitch를 약간 높여서 더 자연스럽게
    if (rate < 1.0) {
      return 1.1; // 약간 높은 pitch
    } else if (rate > 3.0) {
      return 0.85; // 매우 빠른 속도(3.0 이상)에서는 pitch를 더 낮춤
    } else if (rate > 2.0) {
      return 0.9; // 빠른 속도(2.0~3.0)에서는 pitch를 낮춤
    }
    return 1.0; // 기본값 (1.0~2.0)
  };

  // 최적의 한국어 보이스 선택 함수 (edge-TTS 스타일 개선)
  const getBestKoreanVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const koreanVoices = voices.filter(voice => 
      voice.lang.startsWith('ko') || 
      voice.lang.includes('Korean') ||
      voice.lang === 'ko-KR'
    );
    
    if (koreanVoices.length === 0) {
      return null;
    }
    
    // 우선순위: Neural > Premium > Female > 선희 > 기타
    return koreanVoices.find(voice => 
      voice.name.toLowerCase().includes('neural')
    ) || koreanVoices.find(voice => 
      voice.name.toLowerCase().includes('premium')
    ) || koreanVoices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('여성')
    ) || koreanVoices.find(voice => 
      voice.name.toLowerCase().includes('sun') || 
      voice.name.toLowerCase().includes('선희')
    ) || koreanVoices[0]; // 기본값: 첫 번째 한국어 보이스
  };

  // 약어를 자연스러운 발음으로 변환
  const normalizeAbbreviations = (text: string): string => {
    // 일반적인 약어 사전 (영문 약어 -> 한글 발음)
    const abbreviationMap: Record<string, string> = {
      // 은행/금융
      'IBK': '아이비케이',
      'KB': '케이비',
      'NH': '엔에이치',
      'SH': '에스에이치',
      'KDB': '케이디비',
      'BOK': '비오케이',
      
      // 기술/IT
      'AI': '에이아이',
      'IT': '아이티',
      'IoT': '아이오티',
      'VR': '브이알',
      'AR': '에이알',
      'MR': '엠알',
      'XR': '엑스알',
      'API': '에이피아이',
      'UI': '유아이',
      'UX': '유엑스',
      'URL': '유알엘',
      'HTTP': '에이치티티피',
      'HTTPS': '에이치티티피에스',
      'HTML': '에이치티엠엘',
      'CSS': '씨에스에스',
      'JS': '제이에스',
      'JSX': '제이에스엑스',
      'TS': '티에스',
      'TSX': '티에스엑스',
      'JSON': '제이슨',
      'XML': '엑스엠엘',
      'PDF': '피디에프',
      'PNG': '피엔지',
      'JPG': '제이피지',
      'JPEG': '제이펙',
      'GIF': '지아이에프',
      'SVG': '에스브이지',
      'MP3': '엠피쓰리',
      'MP4': '엠피포',
      'AVI': '에이브이아이',
      'MKV': '엠케이브이',
      
      // 직책/조직
      'CEO': '씨이오',
      'CTO': '씨티오',
      'CFO': '씨에프오',
      'CMO': '씨엠오',
      'COO': '씨오오',
      'VP': '브이피',
      'PM': '피엠',
      'HR': '에이치알',
      'PR': '피알',
      'R&D': '알앤디',
      'QA': '큐에이',
      'QC': '큐씨',
      
      // 기업/조직
      'LG': '엘지',
      'SK': '에스케이',
      'KT': '케이티',
      'Samsung': '삼성',
      'Hyundai': '현대',
      'Kia': '기아',
      'POSCO': '포스코',
      'Lotte': '롯데',
      'CJ': '씨제이',
      'GS': '지에스',
      'LS': '엘에스',
      'HD': '에이치디',
      'HD Hyundai': '에이치디 현대',
      
      // 국가/지역
      'USA': '유에스에이',
      'UK': '유케이',
      'EU': '이유',
      'UN': '유엔',
      'UNESCO': '유네스코',
      'WHO': '더블유에이치오',
      'WTO': '더블유티오',
      'IMF': '아이엠에프',
      'OECD': '오이씨디',
      
      // 학위/자격
      'PhD': '피에이치디',
      'MBA': '엠비에이',
      'TOEIC': '토익',
      'TOEFL': '토플',
      'IELTS': '아이엘츠',
      
      // 기타
      'OK': '오케이',
      'FYI': '에프와이아이',
      'ASAP': '에이에스에이피',
      'FAQ': '에프에이큐',
      'Q&A': '큐앤에이',
      'A/S': '에이에스',
      'B2B': '비투비',
      'B2C': '비투씨',
      'C2C': '씨투씨',
      'O2O': '오투오',
      'IPO': '아이피오',
      'M&A': '엠앤에이',
      'ROI': '알오아이',
      'KPI': '케이피아이',
      'NPS': '엔피에스',
      'CSR': '씨에스알',
      'ESG': '이에스지',
      'SDGs': '에스디지즈',
    };
    
    // 약어 변환 (단어 경계와 한글 바로 뒤에 오는 경우 모두 처리)
    // 예: "IBK기업은행" -> "아이비케이 기업은행"
    let normalizedText = text;
    
    // 각 약어를 순회하며 변환
    for (const [abbr, pronunciation] of Object.entries(abbreviationMap)) {
      // 패턴 1: 단어 경계가 있는 경우 (예: "IBK is" -> "아이비케이 is")
      const wordBoundaryRegex = new RegExp(`\\b${abbr}\\b`, 'gi');
      normalizedText = normalizedText.replace(wordBoundaryRegex, pronunciation);
      
      // 패턴 2: 약어 바로 뒤에 한글이 오는 경우 (예: "IBK기업은행" -> "아이비케이기업은행")
      // 이 경우 단어 경계가 없으므로 별도 처리 필요
      const beforeHangulRegex = new RegExp(`${abbr}([가-힣])`, 'gi');
      normalizedText = normalizedText.replace(beforeHangulRegex, (match, hangul) => {
        // 약어와 한글 사이에 공백 추가하여 자연스럽게 읽히도록 함
        return `${pronunciation} ${hangul}`;
      });
    }
    
    // 특별한 케이스: 은행명 패턴 처리
    // "아이비케이기업은행" -> "아이비케이 기업은행" (이미 위에서 처리되지만 추가 보완)
    const bankPatterns = [
      '기업은행', '신한은행', '국민은행', '하나은행', '우리은행', 
      '카카오뱅크', '토스뱅크', '케이뱅크', '카카오뱅크', '토스뱅크'
    ];
    
    for (const bankName of bankPatterns) {
      // "아이비케이기업은행" 같은 패턴을 "아이비케이 기업은행"으로 변환
      const pattern = new RegExp(`([가-힣]+)${bankName}`, 'g');
      normalizedText = normalizedText.replace(pattern, (match, before) => {
        // "아이비케이", "케이비", "엔에이치" 같은 발음으로 끝나는 경우 공백 추가
        if (before.match(/[이에이케이티알오]$/)) {
          return `${before} ${bankName}`;
        }
        return match;
      });
    }
    
    // 최종 보완: "IBK기업은행" 패턴 직접 처리 (위의 일반 변환으로 처리되지 않은 경우)
    normalizedText = normalizedText.replace(/IBK기업은행/gi, '아이비케이 기업은행');
    normalizedText = normalizedText.replace(/아이비케이기업은행/gi, '아이비케이 기업은행');
    
    return normalizedText;
  };

  // 날짜/시간을 자연스러운 형식으로 변환
  const normalizeDateTime = (text: string): string => {
    // "2026년 1월 11일 오전 01:24" 형식을 "2026년 1월 11일 새벽 1시 24분"으로 변환
    // 주의: 날짜 형식이 명확하게 있는 경우만 변환
    text = text.replace(
      /(\d{4})년\s+(\d{1,2})월\s+(\d{1,2})일\s+(오전|오후)\s+(\d{1,2}):(\d{2})/g,
      (match, year, month, day, ampm, hour, minute) => {
        const hourNum = parseInt(hour, 10);
        let timeLabel = '';
        
        if (ampm === '오전') {
          if (hourNum === 0) {
            timeLabel = '자정';
          } else if (hourNum >= 1 && hourNum < 6) {
            timeLabel = '새벽';
          } else {
            timeLabel = '오전';
          }
        } else {
          if (hourNum === 12) {
            timeLabel = '정오';
          } else if (hourNum >= 12 && hourNum < 18) {
            timeLabel = '오후';
          } else {
            timeLabel = '저녁';
          }
        }
        
        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
        const displayMinute = parseInt(minute, 10);
        
        // 분이 0이면 "시"만, 아니면 "시 분"으로 표시
        if (displayMinute === 0) {
          return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${timeLabel} ${displayHour}시`;
        } else {
          return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일 ${timeLabel} ${displayHour}시 ${displayMinute}분`;
        }
      }
    );

    // "오전 01:24" 같은 시간 형식도 변환 (오전/오후가 명확히 있는 경우만)
    text = text.replace(
      /(오전|오후)\s+(\d{1,2}):(\d{2})/g,
      (match, ampm, hour, minute) => {
        const hourNum = parseInt(hour, 10);
        // 시간 범위 검증 (0-23)
        if (hourNum < 0 || hourNum > 23) {
          return match; // 유효하지 않은 시간이면 원본 반환
        }
        
        let timeLabel = '';
        
        if (ampm === '오전') {
          if (hourNum === 0) {
            timeLabel = '자정';
          } else if (hourNum >= 1 && hourNum < 6) {
            timeLabel = '새벽';
          } else {
            timeLabel = '오전';
          }
        } else {
          if (hourNum === 12) {
            timeLabel = '정오';
          } else if (hourNum >= 12 && hourNum < 18) {
            timeLabel = '오후';
          } else {
            timeLabel = '저녁';
          }
        }
        
        const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
        const displayMinute = parseInt(minute, 10);
        
        // 분 범위 검증 (0-59)
        if (displayMinute < 0 || displayMinute > 59) {
          return match; // 유효하지 않은 분이면 원본 반환
        }
        
        if (displayMinute === 0) {
          return `${timeLabel} ${displayHour}시`;
        } else {
          return `${timeLabel} ${displayHour}시 ${displayMinute}분`;
        }
      }
    );

    return text;
  };

  // 마크다운에서 순수 텍스트 추출
  const extractText = (markdown: string): string => {
    // 먼저 헤딩 뒤에 일시정지 마커 추가 (헤딩 제거 전에 처리)
    let text = markdown
      .replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, headingText) => {
        // 헤딩 텍스트 뒤에 짧은 일시정지 마커 추가 (더 빠른 리듬)
        return `${headingText} ... `;
      });

    // 출처 부분 먼저 제거 (읽지 않도록 함)
    // "< 이미지 출처 : 마켓인 - 이데일리 >" 형식의 이미지 출처 부분 전체를 제거
    // "출처: YouTube (https://...)" 형식의 일반 출처도 제거
    // 이미지 태그 제거 전에 먼저 처리하여 출처가 남지 않도록 함
    text = text
      // 이미지 출처 형식 제거: "< 이미지 출처 : ... >" 형식 전체 제거
      .replace(/<\s*이미지\s*출처\s*[:：]\s*[^>]*>/gi, '') // "< 이미지 출처 : ... >" 형식 전체 제거
      .replace(/<\s*이미지출처\s*[:：]\s*[^>]*>/gi, '') // "< 이미지출처 : ... >" 형식 전체 제거
      .replace(/<\s*출처\s*[:：]\s*[^>]*이미지[^>]*>/gi, '') // "< 출처 : ... 이미지 ... >" 형식 전체 제거
      // 줄 전체에 있는 이미지 출처 패턴도 제거
      .replace(/^\s*<\s*이미지\s*출처\s*[:：]\s*[^>]*>\s*$/gim, '') // 줄 전체의 "< 이미지 출처 : ... >" 제거
      .replace(/^\s*<\s*이미지출처\s*[:：]\s*[^>]*>\s*$/gim, '') // 줄 전체의 "< 이미지출처 : ... >" 제거
      // 일반 출처 형식 제거: "출처: YouTube (https://...)" 형식 전체 제거
      .replace(/출처\s*[:：]\s*[^\n]*\(https?:\/\/[^\n\)]*\)[^\n]*/gi, '') // "출처: ... (https://...)" 형식 제거
      .replace(/출처\s*[:：]\s*[^\n]*https?:\/\/[^\n]*/gi, '') // "출처: ... https://..." 형식 제거
      .replace(/^\s*출처\s*[:：]\s*[^\n]*\(https?:\/\/[^\n\)]*\)[^\n]*$/gim, '') // 줄 전체의 "출처: ... (https://...)" 제거
      .replace(/^\s*출처\s*[:：]\s*[^\n]*https?:\/\/[^\n]*$/gim, '') // 줄 전체의 "출처: ... https://..." 제거
      .trim();

    // "관련된 오늘의 메뉴 보러가기" 부분 제거 (음성 읽기에서 제외)
    // 인용구(blockquote) 형식으로 삽입된 내부 링크 부분을 제거
    // 패턴: "> **🍽️ 관련된 오늘의 메뉴 보러가기**\n> \n> 다양한 요리 레시피와 메뉴 아이디어를 확인해보세요: [오늘의 메뉴 보러가기 →](...)"
    text = text
      // "관련된 오늘의 메뉴 보러가기" 텍스트가 포함된 인용구 블록 전체 제거
      // 여러 줄에 걸친 인용구 블록 처리: 각 줄이 > 로 시작하고, 빈 줄이나 다음 비인용구 줄까지 포함
      .replace(/(?:^|\n)(>\s*[^\n]*관련된[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*(?:\n>\s*[^\n]*)*)/gim, '')
      // "다양한 요리 레시피와 메뉴 아이디어" 텍스트가 포함된 인용구 블록도 제거 (위와 연결된 경우)
      .replace(/(?:^|\n)(>\s*[^\n]*다양한[^\n]*요리[^\n]*레시피[^\n]*메뉴[^\n]*아이디어[^\n]*(?:\n>\s*[^\n]*)*)/gim, '')
      // "오늘의 메뉴 보러가기" 링크 텍스트가 포함된 인용구 블록도 제거
      .replace(/(?:^|\n)(>\s*[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*(?:\n>\s*[^\n]*)*)/gim, '')
      .trim();

    // 마크다운 태그 제거
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // 볼드 제거
      .replace(/\*(.*?)\*/g, '$1') // 이탤릭 제거
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // 링크 제거
      .replace(/`([^`]+)`/g, '$1') // 인라인 코드 제거
      .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
      .replace(/^\s*[-*+]\s+/gm, '') // 리스트 마커 제거
      .replace(/^\s*\d+\.\s+/gm, '') // 번호 리스트 제거
      .replace(/>\s+/g, '') // 인용구 제거
      // 이미지 제거 (순서 중요: 먼저 태그, 그 다음 URL, 마지막 파일명)
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // 마크다운 이미지 태그 제거
      .replace(/<img[^>]*>/gi, '') // HTML 이미지 태그 제거
      .replace(/https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s\)]*)?/gi, '') // 이미지 URL 제거
      .replace(/[^\s\)]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s\)]*)?/gi, '') // 이미지 파일명 제거 (URL이 아닌 경우)
      .trim();

    // 출처 부분 재확인 및 제거 (혹시 남아있을 수 있는 경우 대비)
    text = text
      // 이미지 출처 재확인
      .replace(/<\s*이미지\s*출처\s*[:：]\s*[^>]*>/gi, '') // "< 이미지 출처 : ... >" 형식 전체 제거
      .replace(/^\s*<\s*이미지\s*출처\s*[:：]\s*[^>]*>\s*$/gim, '') // 줄 전체의 "< 이미지 출처 : ... >" 제거
      // 일반 출처 재확인 (URL이 포함된 경우)
      .replace(/출처\s*[:：]\s*[^\n]*\(https?:\/\/[^\n\)]*\)[^\n]*/gi, '') // "출처: ... (https://...)" 형식 제거
      .replace(/출처\s*[:：]\s*[^\n]*https?:\/\/[^\n]*/gi, '') // "출처: ... https://..." 형식 제거
      .replace(/^\s*출처\s*[:：]\s*[^\n]*\(https?:\/\/[^\n\)]*\)[^\n]*$/gim, '') // 줄 전체의 "출처: ... (https://...)" 제거
      .replace(/^\s*출처\s*[:：]\s*[^\n]*https?:\/\/[^\n]*$/gim, '') // 줄 전체의 "출처: ... https://..." 제거
      .trim();

    // "관련된 오늘의 메뉴 보러가기" 부분 재확인 및 제거 (마크다운 태그 제거 후에도 남아있을 수 있는 텍스트 제거)
    // 마크다운 태그가 제거된 후에도 다음 텍스트들이 남을 수 있음:
    // - "🍽️ 관련된 오늘의 메뉴 보러가기"
    // - "다양한 요리 레시피와 메뉴 아이디어를 확인해보세요: 오늘의 메뉴 보러가기 →"
    text = text
      // "🍽️ 관련된 오늘의 메뉴 보러가기" 텍스트 제거 (이모지 포함)
      .replace(/[^\n]*🍽️[^\n]*관련된[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*/gi, '')
      // "관련된 오늘의 메뉴 보러가기" 텍스트 제거 (이모지 없이)
      .replace(/[^\n]*관련된[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*/gi, '')
      // "다양한 요리 레시피와 메뉴 아이디어를 확인해보세요" 텍스트 제거
      .replace(/[^\n]*다양한[^\n]*요리[^\n]*레시피[^\n]*메뉴[^\n]*아이디어[^\n]*확인[^\n]*/gi, '')
      // "오늘의 메뉴 보러가기 →" 텍스트 제거 (화살표 포함)
      .replace(/[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*→[^\n]*/gi, '')
      // "오늘의 메뉴 보러가기" 텍스트 제거 (화살표 없이)
      .replace(/[^\n]*오늘의[^\n]*메뉴[^\n]*보러가기[^\n]*/gi, '')
      // 구분선 "---" 제거 (관련 섹션의 구분선일 수 있음)
      .replace(/^[-]{3,}\s*$/gim, '')
      .trim();

    // 괄호 안의 약어 제거 (약어 변환 전에 수행해야 함)
    // 영문 약어나 짧은 영문만 있는 괄호를 제거 (한글이 포함된 괄호는 유지)
    // 예: "인공지능(AI)" -> "인공지능", "로봇과 인공지능(AI)을 통해" -> "로봇과 인공지능을 통해"
    // 패턴: 괄호 안에 영문 대소문자, 숫자, 하이픈, 언더스코어만 있는 경우 (1-15자)
    // 한글이 포함된 괄호는 제외하기 위해 [가-힣]이 없는 경우만 매칭
    const beforeBracketRemoval = text;
    text = text.replace(/\([A-Za-z0-9\-_]{1,15}\)/g, (match) => {
      // 한글이 포함되어 있으면 제거하지 않음
      if (/[가-힣]/.test(match)) {
        return match;
      }
      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('괄호 제거:', match);
      }
      return ''; // 한글이 없으면 괄호와 내용 모두 제거
    });
    
    // 개발 환경에서만 변경 사항 확인
    if (process.env.NODE_ENV === 'development' && beforeBracketRemoval !== text) {
      console.log('괄호 제거 전:', beforeBracketRemoval.substring(0, 100));
      console.log('괄호 제거 후:', text.substring(0, 100));
    }
    
    // 공백 정리 (괄호 제거 후 생긴 이중 공백 제거)
    text = text.replace(/\s+/g, ' ').trim();

    // 약어를 자연스러운 발음으로 변환 (괄호 제거 후 수행)
    text = normalizeAbbreviations(text);

    // 날짜/시간 형식 정규화 (시간 형식이 명확한 경우만)
    text = normalizeDateTime(text);

    // 소수점이 있는 숫자를 한글로 변환 (예: 2.0% -> 이점영 퍼센트)
    // 먼저 소수점 숫자를 처리한 후 일반 정수 숫자를 처리
    text = text.replace(
      /\b(\d+)\.(\d+)\s*%/g,
      (match, intPart, decPart) => {
        const intNum = parseInt(intPart, 10);
        
        // 정수 부분 변환
        let intStr = '';
        if (intNum === 0) {
          intStr = '영';
        } else if (intNum < 10) {
          const units = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          intStr = units[intNum];
        } else if (intNum < 20) {
          const ones = intNum % 10;
          const onesMap = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          intStr = `십${onesMap[ones]}`;
        } else if (intNum < 100) {
          const tens = Math.floor(intNum / 10);
          const ones = intNum % 10;
          const tensMap = ['', '', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          const onesMap = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          if (ones === 0) {
            intStr = `${tensMap[tens]}십`;
          } else {
            intStr = `${tensMap[tens]}십${onesMap[ones]}`;
          }
        } else {
          return match; // 100 이상은 그대로
        }
        
        // 소수점 부분 변환 (한 자리씩 읽기)
        let decStr = '';
        const decStrArr = decPart.split('');
        for (const digit of decStrArr) {
          const d = parseInt(digit, 10);
          const units = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          decStr += units[d];
        }
        
        return `${intStr}점${decStr} 퍼센트`;
      }
    );

    // 일반 숫자를 한글로 변환하여 시간 형식으로 오인되지 않도록 처리
    // 단, 이미 시간 형식으로 변환된 부분은 제외
    // 예: "23" -> "이십삼" (단, "23시", "23분" 같은 시간 표현은 그대로 유지)
    text = text.replace(
      /\b(\d{1,2})\b(?![시분초점])/g,
      (match, num) => {
        const number = parseInt(num, 10);
        // 0-99 범위의 숫자를 한글로 변환
        if (number === 0) return '영';
        if (number < 10) {
          const units = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          return units[number];
        } else if (number < 20) {
          const ones = number % 10;
          const onesMap = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          return `십${onesMap[ones]}`;
        } else if (number < 100) {
          const tens = Math.floor(number / 10);
          const ones = number % 10;
          const tensMap = ['', '', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          const onesMap = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
          if (ones === 0) {
            // 10의 배수: "이십", "삼십" 등
            return `${tensMap[tens]}십`;
          } else {
            // 일반 숫자: "이십삼", "삼십오" 등
            return `${tensMap[tens]}십${onesMap[ones]}`;
          }
        }
        return match; // 100 이상은 그대로
      }
    );

    // 문장 구분을 자연스럽게 만들기
    // 마침표와 제목 줄바꿈 시점에 짧은 일시정지 추가
    text = text
      .replace(/(\.)\s+/g, '$1 ... ') // 마침표 뒤에 짧은 일시정지 마커 추가
      .replace(/(\.)\s*$/gm, '$1 ... ') // 줄 끝의 마침표 뒤에도 일시정지 마커 추가
      .replace(/([!?])\s+/g, '$1 ') // 느낌표, 물음표는 공백만 유지 (자연스럽게)
      .replace(/([!?])\s*$/gm, '$1 ') // 줄 끝의 느낌표, 물음표 뒤에도 공백만
      .replace(/\n\s*\n/g, ' ... ') // 단락 구분(줄바꿈 2개)에 일시정지 마커 추가
      .replace(/\n/g, ' ') // 단일 줄바꿈은 공백으로 변환
      // 쉼표 뒤에는 일시정지 없이 자연스럽게 (현재 방식 유지)
      .replace(/\s+/g, ' '); // 연속된 공백을 하나로

    // 불필요한 공백 정리 및 자연스러운 읽기를 위한 처리
    text = text
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .replace(/\s+([.,!?;:])/g, '$1') // 문장 부호 앞 공백 제거 (일시정지 마커 제외)
      .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1 $2') // 연속된 문장 부호 사이 공백 추가
      .replace(/\.\.\.\s+\.\.\./g, '...') // 중복된 일시정지 마커 제거
      // 자연스러운 읽기를 위한 추가 처리
      .replace(/\s+/g, ' ') // 최종 공백 정리
      .trim();

    return text;
  };

  // 에러 핸들러 함수 (컴포넌트 레벨로 올려서 속도 변경 시에도 접근 가능하게 함)
  const handleUtteranceError = (event: SpeechSynthesisErrorEvent | Event, utterance: SpeechSynthesisUtterance) => {
    // event 객체의 속성 안전하게 확인
    let errorType = 'unknown';
    try {
      if (event && typeof event === 'object') {
        // 여러 방법으로 error 속성 확인
        const eventAny = event as unknown as Record<string, unknown>;
        if (eventAny.error !== undefined && eventAny.error !== null) {
          errorType = String(eventAny.error);
        } else if ('error' in event) {
          const speechEvent = event as SpeechSynthesisErrorEvent;
          if (speechEvent.error) {
            errorType = String(speechEvent.error);
          }
        }
      }
    } catch (err) {
      // 에러 타입 확인 실패 시 기본값 사용
      errorType = 'unknown';
      // 개발 환경에서만 상세 로깅
      if (process.env.NODE_ENV === 'development') {
        console.warn('에러 타입 확인 실패:', err);
      }
    }
    
    // canceled와 interrupted 에러는 정상적인 동작이므로 조기 return (로깅하지 않음)
    // - canceled: 사용자가 중지 버튼을 누르거나 명시적으로 cancel() 호출 시
    // - interrupted: 속도 변경 시 cancel() 호출로 인한 중단
    if (errorType === 'canceled' || errorType === 'interrupted') {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }
    
    // 모든 재생 중지 (canceled가 아닌 경우에만)
    try {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    } catch {
      // 취소 실패 시 무시
    }
    
    // 에러 타입에 따른 메시지 설정
    let errorMessage = '음성 읽기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    // 에러 타입별 메시지 설정
    if (errorType !== 'unknown') {
      switch (errorType) {
        case 'network':
          errorMessage = '네트워크 오류로 인해 음성을 읽을 수 없습니다.';
          break;
        case 'synthesis':
          errorMessage = '음성 합성 오류가 발생했습니다.';
          break;
        case 'synthesis-unavailable':
          errorMessage = '음성 합성 서비스를 사용할 수 없습니다.';
          break;
        case 'synthesis-failed':
          errorMessage = '음성 합성에 실패했습니다.';
          break;
        case 'audio-busy':
          errorMessage = '오디오가 사용 중입니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'audio-hardware':
          errorMessage = '오디오 하드웨어 오류가 발생했습니다.';
          break;
        case 'not-allowed':
          errorMessage = '음성 읽기 권한이 없습니다. 브라우저 설정을 확인해주세요.';
          break;
        case 'interrupted':
          errorMessage = '음성 읽기가 중단되었습니다.';
          break;
        case 'language-unavailable':
          errorMessage = '한국어 음성 엔진을 사용할 수 없습니다.';
          break;
        default:
          // 알 수 없는 오류 타입이지만 에러가 발생한 것은 맞음
          errorMessage = '음성 읽기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
    }
    
    // 개발 환경에서만 상세 로깅
    if (process.env.NODE_ENV === 'development') {
      let utteranceText = '';
      let utteranceLang = 'unknown';
      let utteranceRate = 0;
      let textLength = 0;
      
      try {
        if (utterance && typeof utterance === 'object') {
          utteranceText = (utterance as SpeechSynthesisUtterance).text?.substring(0, 100) || '';
          utteranceLang = (utterance as SpeechSynthesisUtterance).lang || 'unknown';
          utteranceRate = (utterance as SpeechSynthesisUtterance).rate || 0;
          textLength = (utterance as SpeechSynthesisUtterance).text?.length || 0;
        }
      } catch (err) {
        // utterance 정보 추출 실패 시 무시
        console.warn('utterance 정보 추출 실패:', err);
      }
      
      let synthesisState = 'unknown';
      try {
        if (synthRef.current && typeof synthRef.current === 'object') {
          synthesisState = (synthRef.current as SpeechSynthesis).speaking ? 'speaking' : 
                          (synthRef.current as SpeechSynthesis).pending ? 'pending' : 
                          (synthRef.current as SpeechSynthesis).paused ? 'paused' : 'idle';
        }
      } catch (err) {
        // 상태 확인 실패 시 무시
        console.warn('synthesis 상태 확인 실패:', err);
      }
      
      // 더 명확한 로깅 형식 사용 (각 속성을 개별적으로 로깅하여 빈 객체 문제 방지)
      try {
        const logData = {
          errorType: String(errorType || 'unknown'),
          errorMessage: String(errorMessage || '알 수 없는 오류'),
          synthesisState: String(synthesisState || 'unknown'),
          utteranceText: String(utteranceText || '(없음)'),
          utteranceLang: String(utteranceLang || 'unknown'),
          utteranceRate: Number(utteranceRate || 0),
          textLength: Number(textLength || 0),
        };
        
        // JSON.stringify를 사용하여 안전하게 로깅
        console.error('TTS 오류 (개발 모드):', JSON.stringify(logData, null, 2));
        
        // 추가로 각 속성을 개별적으로도 로깅 (디버깅 용이성)
        console.error('  - 에러 타입:', logData.errorType);
        console.error('  - 에러 메시지:', logData.errorMessage);
        console.error('  - 합성 상태:', logData.synthesisState);
        console.error('  - 텍스트:', logData.utteranceText);
        console.error('  - 언어:', logData.utteranceLang);
        console.error('  - 속도:', logData.utteranceRate);
        console.error('  - 텍스트 길이:', logData.textLength);
      } catch {
        // 로깅 실패 시 간단한 메시지만 출력
        console.error('TTS 오류 발생:', errorMessage, `(타입: ${errorType})`);
      }
    }
    
    setError(errorMessage);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (!synthRef.current || !isSupported) return;

    // 에러 상태 초기화
    setError(null);

    if (isPaused) {
      // 일시정지 상태면 재개
      try {
        // 먼저 resume() 시도 (가장 자연스러운 방법)
        if (synthRef.current.paused) {
          synthRef.current.resume();
          setIsPaused(false);
          setIsPlaying(true);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('일시정지 재개 - resume() 사용');
          }
        } else {
          // resume()이 불가능한 경우 (이미 재생 중이거나 다른 상태)
          // 현재 재생 중인 부분부터 재생
          if (synthRef.current) {
            synthRef.current.cancel();
          }
          
          // 대기 중인 모든 timeout 취소
          timeoutIdsRef.current.forEach(id => clearTimeout(id));
          timeoutIdsRef.current = [];
          
          // 현재 재생 중인 부분부터 새 속도로 재생
          if (currentPlayingIndexRef.current < textPartsRef.current.length) {
            const currentPartIndex = currentPlayingIndexRef.current;
            const selectedVoice = getBestKoreanVoice();
            const currentUtterance = new SpeechSynthesisUtterance(textPartsRef.current[currentPartIndex]);
            currentUtterance.lang = selectedVoice?.lang || 'ko-KR';
            currentUtterance.voice = selectedVoice; // 최적의 보이스 설정
            currentUtterance.rate = speechRateRef.current; // 최신 속도 사용
            currentUtterance.pitch = getPitchForRate(speechRateRef.current); // 속도에 따른 pitch 조절
            currentUtterance.volume = 1.0;
            
            if (process.env.NODE_ENV === 'development') {
              console.log('일시정지 재개 - 현재 부분부터 재생:', speechRateRef.current, 'x', '(인덱스:', currentPartIndex, ')');
            }
            
            currentUtterance.onstart = () => {
              setIsPlaying(true);
              setIsPaused(false);
              setError(null);
              currentPlayingIndexRef.current = currentPartIndex;
            };
            
            currentUtterance.onend = () => {
              if (playNextPartRef.current) {
                playNextPartRef.current();
              }
            };
            
            currentUtterance.onerror = (event) => {
              handleUtteranceError(event, currentUtterance);
            };
            
            utteranceRef.current = currentUtterance;
            currentIndexRef.current = currentPartIndex;
            
            synthRef.current.speak(currentUtterance);
          } else {
            // 재생할 부분이 없으면 완료 상태로
            setIsPlaying(false);
            setIsPaused(false);
            setError(null);
          }
        }
      } catch (err) {
        console.error('TTS 재개 오류:', err);
        // resume() 실패 시 현재 부분부터 재생 시도
        try {
          if (synthRef.current) {
            synthRef.current.cancel();
          }
          
          timeoutIdsRef.current.forEach(id => clearTimeout(id));
          timeoutIdsRef.current = [];
          
          if (currentPlayingIndexRef.current < textPartsRef.current.length) {
            const currentPartIndex = currentPlayingIndexRef.current;
            const selectedVoice = getBestKoreanVoice();
            const currentUtterance = new SpeechSynthesisUtterance(textPartsRef.current[currentPartIndex]);
            currentUtterance.lang = selectedVoice?.lang || 'ko-KR';
            currentUtterance.voice = selectedVoice; // 최적의 보이스 설정
            currentUtterance.rate = speechRateRef.current;
            currentUtterance.pitch = getPitchForRate(speechRateRef.current); // 속도에 따른 pitch 조절
            currentUtterance.volume = 1.0;
            
            currentUtterance.onstart = () => {
              setIsPlaying(true);
              setIsPaused(false);
              setError(null);
              currentPlayingIndexRef.current = currentPartIndex;
            };
            
            currentUtterance.onend = () => {
              if (playNextPartRef.current) {
                playNextPartRef.current();
              }
            };
            
            currentUtterance.onerror = (event) => {
              handleUtteranceError(event, currentUtterance);
            };
            
            utteranceRef.current = currentUtterance;
            currentIndexRef.current = currentPartIndex;
            
            synthRef.current.speak(currentUtterance);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
            setError(null);
          }
        } catch (retryErr) {
          console.error('TTS 재개 재시도 오류:', retryErr);
          setError('음성 재생을 재개할 수 없습니다.');
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    } else {
      // 기존 재생 중지
      synthRef.current.cancel();

      // 새로운 음성 생성
      let textToRead = '';
      try {
        const extractedText = extractText(content);
        if (!extractedText || extractedText.trim().length === 0) {
          setError('읽을 내용이 없습니다.');
          return;
        }
        
        // 읽기 순서: 제목 -> 메타 설명 -> 본문
        // 제목도 extractText를 거쳐서 약어 변환 등이 적용되도록 함
        const extractedTitle = extractText(title);
        
        if (metaDescription && metaDescription.trim().length > 0) {
          const extractedMeta = extractText(metaDescription);
          textToRead = `${extractedTitle}. ${extractedMeta}. ${extractedText}`;
        } else {
          textToRead = `${extractedTitle}. ${extractedText}`;
        }
        
        // 텍스트 길이 제한 (너무 긴 텍스트는 에러 발생 가능)
        if (textToRead.length > 50000) {
          setError('텍스트가 너무 깁니다. 일부만 읽습니다.');
          textToRead = textToRead.substring(0, 50000) + '...';
        }
      } catch (err) {
        console.error('텍스트 추출 오류:', err);
        setError('텍스트를 처리하는 중 오류가 발생했습니다.');
        return;
      }
      
      // 텍스트를 문장 단위로 나누어 속도 변경 시 효율적으로 처리
      // 문장 단위로 나누면 속도 변경 시 현재 문장만 중복되므로 더 효율적
      // 마침표와 제목 줄바꿈 시점에는 짧은 일시정지 추가
      
      // 1단계: 일시정지 마커("...")로 먼저 나누기 (의도적인 일시정지 구분)
      // 마침표 뒤와 제목/줄바꿈 뒤에 일시정지 마커가 있음
      const pauseParts = textToRead.split(/\s*\.\.\.\s*/).filter(part => part.trim().length > 0);
      
      // 2단계: 각 부분을 문장 단위로 세분화하고 일시정지 정보 추적
      const sentenceParts: string[] = [];
      const hasPauseAfter: boolean[] = []; // 각 문장 뒤에 일시정지가 있는지 표시
      
      for (let partIndex = 0; partIndex < pauseParts.length; partIndex++) {
        const part = pauseParts[partIndex];
        const isLastPart = partIndex === pauseParts.length - 1;
        
        // 문장 단위로 나누기: 마침표(.), 느낌표(!), 물음표(?) 뒤에 공백이 오는 경우를 기준
        const segments = part.split(/([.!?]+(?:\s+|$))/);
        
        let currentSentence = '';
        
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          
          if (!segment || segment.trim().length === 0) {
            continue;
          }
          
          // 문장 부호로 끝나는 구분자인 경우 (예: ". ", "! ", "? " 또는 ".", "!", "?"로 끝나는 경우)
          if (/^[.!?]+(?:\s+|$)/.test(segment)) {
            // 현재 문장에 구분자 추가하고 문장 완료
            if (currentSentence.trim()) {
              currentSentence += segment;
              sentenceParts.push(currentSentence.trim());
              
              // 마침표(.)로 끝나고 일시정지 마커가 있는 경우 일시정지 표시
              // (일시정지 마커로 나눴으므로, 마지막 부분이 아니면 일시정지가 있음)
              const hasPause = !isLastPart && /\./.test(segment);
              hasPauseAfter.push(hasPause);
              
              currentSentence = '';
            } else if (sentenceParts.length > 0) {
              // 이전 문장에 구분자 추가 (빈 문장이 아닌 경우)
              sentenceParts[sentenceParts.length - 1] += segment;
              
              // 이전 문장의 일시정지 정보 업데이트
              if (hasPauseAfter.length > 0) {
                const hasPause = !isLastPart && /\./.test(segment);
                hasPauseAfter[hasPauseAfter.length - 1] = hasPause;
              }
            }
          } else {
            // 일반 텍스트인 경우
            currentSentence += segment;
          }
        }
        
        // 마지막 문장이 남아있으면 추가 (문장 부호가 없는 경우)
        if (currentSentence.trim()) {
          sentenceParts.push(currentSentence.trim());
          // 마지막 부분이 아니면 일시정지가 있음 (제목/줄바꿈의 경우)
          hasPauseAfter.push(!isLastPart);
        }
      }
      
      // 문장 단위로 나눈 결과 사용 (최소 1개는 있어야 함)
      let textParts: string[] = [];
      let pauseAfter: boolean[] = [];
      
      if (sentenceParts.length > 0) {
        textParts = sentenceParts;
        pauseAfter = hasPauseAfter;
        if (process.env.NODE_ENV === 'development') {
          console.log('텍스트를 문장 단위로 나눔:', textParts.length, '개 문장');
        }
      } else {
        // 문장 단위로 나눌 수 없는 경우 원본 사용
        textParts = pauseParts;
        pauseAfter = pauseParts.map(() => false); // 일시정지 없음
        if (process.env.NODE_ENV === 'development') {
          console.log('문장 단위 분할 실패, 원본 사용:', textParts.length, '개 부분');
        }
      }
      
      if (textParts.length === 0) {
        setError('읽을 내용이 없습니다.');
        return;
      }
      
      // 텍스트 부분들을 ref에 저장 (속도 변경 시 사용)
      textPartsRef.current = textParts;
      pauseAfterRef.current = pauseAfter; // 일시정지 정보 저장
      
      // 단어 단위로도 나눠서 저장 (속도 변경 시 현재 위치부터 이어서 읽기 위해)
      const allWords: string[] = [];
      for (const sentence of textParts) {
        // 문장을 단어 단위로 나누기 (공백, 문장 부호 기준)
        const words = sentence.split(/(\s+|[.!?]+)/).filter(word => word.trim().length > 0);
        allWords.push(...words);
      }
      wordPartsRef.current = allWords;
      currentWordIndexRef.current = 0; // 단어 인덱스 초기화
      
      currentIndexRef.current = 0; // 다음에 재생할 인덱스 (첫 번째 부분)
      currentPlayingIndexRef.current = 0; // 현재 재생 중인 부분의 인덱스 (첫 번째 부분)
      
      // 최적의 한국어 보이스 선택 (edge-TTS 스타일 개선)
      const selectedVoice = getBestKoreanVoice();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('선택된 보이스:', selectedVoice?.name || '기본 보이스', selectedVoice?.lang || 'ko-KR');
      }
      
      // 첫 번째 utterance 생성
      const firstUtterance = new SpeechSynthesisUtterance(textParts[0]);
      firstUtterance.lang = selectedVoice?.lang || 'ko-KR';
      firstUtterance.voice = selectedVoice; // 최적의 보이스 설정
      
      // ref에서 최신 속도 값 사용
      const initialRate = speechRateRef.current;
      firstUtterance.rate = initialRate;
      
      // 개발 환경에서만 로그 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('첫 번째 부분 재생 속도:', initialRate, 'x', '보이스:', selectedVoice?.name);
      }
      
      firstUtterance.pitch = getPitchForRate(initialRate); // 속도에 따른 pitch 조절
      firstUtterance.volume = 1.0; // 볼륨 (0 ~ 1)
      
      // 정확한 위치 추적을 위한 onboundary 이벤트 추가 (지원 브라우저에서만)
      if (isBoundarySupportedRef.current) {
        firstUtterance.onboundary = (event: SpeechSynthesisEvent) => {
          if (event.name === 'word' || event.name === 'sentence') {
            currentCharIndexRef.current = event.charIndex;
            if (event.name === 'sentence') {
              // 문장 경계에서 문장 시작 위치 업데이트
              currentSentenceStartCharIndexRef.current = event.charIndex;
            }
            
            if (process.env.NODE_ENV === 'development') {
              console.log('경계 이벤트:', {
                name: event.name,
                charIndex: event.charIndex,
                text: event.utterance.text.substring(0, event.charIndex)
              });
            }
          }
        };
      }
      
      // 위치 추적 초기화
      currentCharIndexRef.current = 0;
      currentSentenceStartCharIndexRef.current = 0;
      
      // 첫 번째 utterance 이벤트 핸들러
      firstUtterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);
        currentPlayingIndexRef.current = 0; // 첫 번째 부분 재생 시작
      };
      
      // playNextPart 함수를 ref에 저장하여 속도 변경 시에도 접근 가능하게 함
      const playNextPart = () => {
        // 속도 변경 중이면 재생하지 않음 (중복 재생 방지)
        if (isRateChangingRef.current) {
          if (process.env.NODE_ENV === 'development') {
            console.log('속도 변경 중이므로 재생 건너뜀');
          }
          return;
        }
        
        // 다음 부분의 인덱스로 이동
        currentIndexRef.current++;
        currentPlayingIndexRef.current = currentIndexRef.current; // 현재 재생 중인 부분 업데이트
        
        if (currentIndexRef.current < textPartsRef.current.length) {
          // 이전 문장 뒤에 일시정지가 있는지 확인
          const prevIndex = currentIndexRef.current - 1;
          const hasPause = prevIndex >= 0 && pauseAfterRef.current[prevIndex];
          
          // 일시정지 시간 설정:
          // - 마침표/제목/줄바꿈 뒤: 200ms (자연스러운 끊김)
          // - 그 외: 0ms (부드러운 연결)
          const pauseTime = hasPause ? 200 : 0;
          
          // setTimeout 내부에서 최신 speechRateRef.current를 읽도록 함
          const timeoutId = window.setTimeout(() => {
            if (!synthRef.current) return;
            
            // 속도 변경 중이면 재생하지 않음 (중복 재생 방지)
            if (isRateChangingRef.current) {
              if (process.env.NODE_ENV === 'development') {
                console.log('setTimeout 실행 시점에 속도 변경 중이므로 재생 건너뜀');
              }
              return;
            }
            
            // setTimeout 실행 시점에 최신 속도 값 읽기 (항상 최신 값 참조)
            const currentRate = speechRateRef.current;
            
            // 최적의 한국어 보이스 재선택 (동일한 보이스 유지)
            const selectedVoice = getBestKoreanVoice();
            
            const nextUtterance = new SpeechSynthesisUtterance(textPartsRef.current[currentIndexRef.current]);
            nextUtterance.lang = selectedVoice?.lang || 'ko-KR';
            nextUtterance.voice = selectedVoice; // 최적의 보이스 설정
            nextUtterance.rate = currentRate;
            
            // 개발 환경에서만 로그 출력
            if (process.env.NODE_ENV === 'development') {
              console.log('다음 부분 재생 속도:', currentRate, 'x', '(인덱스:', currentIndexRef.current, ')');
            }
            
            nextUtterance.pitch = getPitchForRate(currentRate); // 속도에 따른 pitch 조절
            nextUtterance.volume = 1.0;
            
            // 정확한 위치 추적을 위한 onboundary 이벤트 추가 (지원 브라우저에서만)
            if (isBoundarySupportedRef.current) {
              nextUtterance.onboundary = (event: SpeechSynthesisEvent) => {
                if (event.name === 'word' || event.name === 'sentence') {
                  // 현재 문장까지의 문자 수를 고려하여 전체 텍스트에서의 위치 계산
                  let totalCharIndex = 0;
                  for (let i = 0; i < currentIndexRef.current; i++) {
                    if (i < textPartsRef.current.length) {
                      totalCharIndex += textPartsRef.current[i].length;
                    }
                  }
                  currentCharIndexRef.current = totalCharIndex + event.charIndex;
                  
                  if (event.name === 'sentence') {
                    currentSentenceStartCharIndexRef.current = totalCharIndex + event.charIndex;
                  }
                  
                  if (process.env.NODE_ENV === 'development') {
                    console.log('경계 이벤트 (다음 부분):', {
                      name: event.name,
                      charIndex: event.charIndex,
                      totalCharIndex: currentCharIndexRef.current,
                      sentenceIndex: currentIndexRef.current
                    });
                  }
                }
              };
            }
            
            nextUtterance.onend = () => {
              if (playNextPartRef.current && !isRateChangingRef.current) {
                playNextPartRef.current();
              }
            };
            
            nextUtterance.onerror = (event) => {
              handleUtteranceError(event, nextUtterance);
            };
            
            synthRef.current.speak(nextUtterance);
            utteranceRef.current = nextUtterance; // 현재 재생 중인 utterance 저장
            currentPlayingIndexRef.current = currentIndexRef.current; // 현재 재생 중인 부분 업데이트
          }, pauseTime); // 일시정지 시간 (마침표/제목/줄바꿈: 200ms, 그 외: 0ms)
          
          // timeout ID 저장 (필요시 취소 가능)
          timeoutIdsRef.current.push(timeoutId);
        } else {
          // 모든 부분 재생 완료
          setIsPlaying(false);
          setIsPaused(false);
          setError(null);
          textPartsRef.current = [];
          wordPartsRef.current = [];
          pauseAfterRef.current = [];
          currentIndexRef.current = 0;
          currentPlayingIndexRef.current = 0;
          currentWordIndexRef.current = 0;
          timeoutIdsRef.current = [];
          playNextPartRef.current = null;
          isRateChangingRef.current = false;
        }
      };
      
      // playNextPart 함수를 ref에 저장 (속도 변경 시 접근 가능)
      playNextPartRef.current = playNextPart;
      
      firstUtterance.onend = () => {
        if (playNextPartRef.current && !isRateChangingRef.current) {
          playNextPartRef.current();
        }
      };
      
      utteranceRef.current = firstUtterance; // 현재 재생 중인 utterance 저장
      currentPlayingIndexRef.current = 0; // 첫 번째 부분 재생 시작
      
      firstUtterance.onerror = (event) => {
        handleUtteranceError(event, firstUtterance);
      };
      
      try {
        synthRef.current.speak(firstUtterance);
      } catch (err) {
        console.error('TTS speak 오류:', err);
        setError('음성 읽기를 시작할 수 없습니다.');
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const handlePause = () => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      try {
        synthRef.current.pause();
        setIsPaused(true);
        setIsPlaying(false);
        
        // 일시정지 시 현재 재생 중인 부분의 인덱스는 유지
        // currentPlayingIndexRef.current는 이미 올바른 값이므로 업데이트 불필요
        if (process.env.NODE_ENV === 'development') {
          console.log('일시정지 - 현재 인덱스:', currentPlayingIndexRef.current);
        }
      } catch (err) {
        console.error('일시정지 오류:', err);
        setError('일시정지 중 오류가 발생했습니다.');
      }
    }
  };

  const handleStop = () => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setError(null);
    // timeout 취소
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
    // 플래그 및 인덱스 초기화
    isRateChangingRef.current = false;
    currentIndexRef.current = 0;
    currentPlayingIndexRef.current = 0;
    currentWordIndexRef.current = 0;
    wordPartsRef.current = [];
    pauseAfterRef.current = [];
  };

  if (!isSupported) {
    return (
      <div className="
        p-4 rounded-xl
        bg-amber-50 dark:bg-amber-900/20
        border border-amber-200 dark:border-amber-800
        text-amber-800 dark:text-amber-200
        text-sm
      ">
        이 브라우저는 음성 읽기 기능을 지원하지 않습니다.
      </div>
    );
  }

  // 재생 중이거나 일시정지 중일 때만 floating 버튼 표시
  if (isPlaying || isPaused) {
    return (
      <>
        {/* Floating 버튼 - 헤더 아래 우측 상단에 배치 */}
        <div className="
          fixed top-16 right-4 sm:top-20 sm:right-6
          z-50
          flex flex-col gap-3
        ">
          {/* 전체 패널 (showFullPanel이 true일 때만 표시) */}
          {showFullPanel && (
            <div className="
              mb-3
              w-80 sm:w-96
              p-4 sm:p-6
              bg-white dark:bg-gray-800
              rounded-2xl
              shadow-xl dark:shadow-gray-900/70
              border border-gray-200 dark:border-gray-700
              animate-in slide-in-from-bottom-4
            ">
              {error && (
                <div className="
                  mb-4 p-3
                  bg-red-50 dark:bg-red-900/20
                  border border-red-200 dark:border-red-800
                  rounded-lg
                  text-red-800 dark:text-red-200
                  text-sm
                ">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                {/* 속도 선택 */}
                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="
                      block text-xs sm:text-sm
                      font-medium
                      text-gray-700 dark:text-gray-300
                      mb-1.5
                    ">
                      읽기 속도: {speechRate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="4.0"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => {
                        const newRate = parseFloat(e.target.value);
                        setSpeechRate(newRate);
                        speechRateRef.current = newRate;
                        
                        if (process.env.NODE_ENV === 'development') {
                          console.log('속도 변경:', newRate, 'x', '(재생 중:', isPlaying, ')');
                        }
                        
                        if ((isPlaying || isPaused) && textPartsRef.current.length > 0) {
                          isRateChangingRef.current = true;
                          
                          if (synthRef.current) {
                            synthRef.current.cancel();
                          }
                          
                          timeoutIdsRef.current.forEach(id => clearTimeout(id));
                          timeoutIdsRef.current = [];
                          
                          // 현재 재생 중인 문장의 인덱스
                          const currentPlayingIndex = currentPlayingIndexRef.current >= 0 
                            ? currentPlayingIndexRef.current 
                            : Math.max(0, currentIndexRef.current);
                          
                          let textToContinue = '';
                          let startIndex = currentPlayingIndex;
                          
                          // onboundary 이벤트를 지원하는 경우 정확한 위치부터 재생
                          if (isBoundarySupportedRef.current && currentCharIndexRef.current > 0) {
                            // 전체 텍스트를 하나로 합침
                            const fullText = textPartsRef.current.join(' ');
                            
                            // 현재 문자 위치부터 나머지 텍스트 추출
                            textToContinue = fullText.substring(currentCharIndexRef.current);
                            
                            // 현재 위치가 속한 문장 찾기
                            let charCount = 0;
                            for (let i = 0; i < textPartsRef.current.length; i++) {
                              const sentenceLength = textPartsRef.current[i].length;
                              if (charCount + sentenceLength > currentCharIndexRef.current) {
                                startIndex = i;
                                break;
                              }
                              charCount += sentenceLength + 1; // +1은 공백
                            }
                            
                            if (process.env.NODE_ENV === 'development') {
                              console.log('정확한 위치부터 재생:', {
                                currentCharIndex: currentCharIndexRef.current,
                                startIndex: startIndex,
                                textLength: textToContinue.length
                              });
                            }
                          } else {
                            // onboundary를 지원하지 않는 경우 현재 문장부터 재생
                            const remainingSentences = textPartsRef.current.slice(currentPlayingIndex);
                            textToContinue = remainingSentences.join(' ');
                            
                            if (process.env.NODE_ENV === 'development') {
                              console.log('현재 문장부터 재생 (폴백):', {
                                currentPlayingIndex: currentPlayingIndex,
                                remainingSentencesCount: remainingSentences.length
                              });
                            }
                          }
                          
                          if (synthRef.current && textToContinue.trim().length > 0) {
                            const selectedVoice = getBestKoreanVoice();
                            const nextUtterance = new SpeechSynthesisUtterance(textToContinue);
                            nextUtterance.lang = selectedVoice?.lang || 'ko-KR';
                            nextUtterance.voice = selectedVoice;
                            nextUtterance.rate = newRate;
                            nextUtterance.pitch = getPitchForRate(newRate); // 속도에 따른 pitch 조절
                            nextUtterance.volume = 1.0;
                            
                            // onboundary 이벤트 추가 (지원 브라우저에서만)
                            if (isBoundarySupportedRef.current) {
                              nextUtterance.onboundary = (event: SpeechSynthesisEvent) => {
                                if (event.name === 'word' || event.name === 'sentence') {
                                  // 전체 텍스트에서의 위치 계산
                                  let totalCharIndex = 0;
                                  for (let i = 0; i < startIndex; i++) {
                                    if (i < textPartsRef.current.length) {
                                      totalCharIndex += textPartsRef.current[i].length + 1; // +1은 공백
                                    }
                                  }
                                  currentCharIndexRef.current = totalCharIndex + event.charIndex;
                                  
                                  if (event.name === 'sentence') {
                                    currentSentenceStartCharIndexRef.current = totalCharIndex + event.charIndex;
                                  }
                                }
                              };
                            }
                            
                            // 현재 문장 인덱스 유지
                            currentIndexRef.current = startIndex;
                            currentPlayingIndexRef.current = startIndex;
                            
                            const originalPlayNextPart = playNextPartRef.current;
                            
                            nextUtterance.onstart = () => {
                              isRateChangingRef.current = false;
                              setIsPlaying(true);
                              setIsPaused(false);
                              setError(null);
                            };
                            
                            nextUtterance.onend = () => {
                              isRateChangingRef.current = false;
                              // 재생이 끝나면 다음 문장부터 문장 단위로 재생
                              if (originalPlayNextPart) {
                                // 재생이 끝난 위치 계산
                                let endCharIndex = 0;
                                for (let i = 0; i <= startIndex; i++) {
                                  if (i < textPartsRef.current.length) {
                                    endCharIndex += textPartsRef.current[i].length;
                                    if (i < startIndex) endCharIndex += 1; // 공백
                                  }
                                }
                                endCharIndex += textToContinue.length;
                                
                                // 다음 문장 인덱스 찾기
                                let nextSentenceIndex = startIndex;
                                let charCount = 0;
                                for (let i = 0; i < textPartsRef.current.length; i++) {
                                  charCount += textPartsRef.current[i].length;
                                  if (charCount >= endCharIndex) {
                                    nextSentenceIndex = i + 1;
                                    break;
                                  }
                                  charCount += 1; // 공백
                                }
                                
                                currentIndexRef.current = nextSentenceIndex;
                                currentPlayingIndexRef.current = nextSentenceIndex;
                                currentCharIndexRef.current = endCharIndex;
                                
                                originalPlayNextPart();
                              } else {
                                setIsPlaying(false);
                                setIsPaused(false);
                              }
                            };
                            
                            nextUtterance.onerror = (event) => {
                              isRateChangingRef.current = false;
                              handleUtteranceError(event, nextUtterance);
                            };
                            
                            utteranceRef.current = nextUtterance;
                            
                            try {
                              setIsPlaying(true);
                              setIsPaused(false);
                              setError(null);
                              synthRef.current.speak(nextUtterance);
                            } catch (err) {
                              console.error('속도 변경 시 재생 오류:', err);
                              isRateChangingRef.current = false;
                              setIsPlaying(false);
                              setIsPaused(false);
                              setError('속도 변경 중 오류가 발생했습니다.');
                            }
                          } else {
                            isRateChangingRef.current = false;
                            setIsPlaying(false);
                            setIsPaused(false);
                            setError(null);
                            textPartsRef.current = [];
                            wordPartsRef.current = [];
                            currentIndexRef.current = 0;
                            currentPlayingIndexRef.current = 0;
                            currentWordIndexRef.current = 0;
                            currentCharIndexRef.current = 0;
                            timeoutIdsRef.current = [];
                            playNextPartRef.current = null;
                          }
                        }
                      }}
                      className="
                        w-full h-2
                        bg-gray-200 dark:bg-gray-700
                        rounded-lg
                        appearance-none
                        cursor-pointer
                        accent-emerald-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>0.5x</span>
                      <span>1.0x</span>
                      <span>2.0x</span>
                      <span>3.0x</span>
                      <span>4.0x</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <div>
                      <h3 className="
                        text-sm sm:text-base
                        font-semibold
                        text-gray-900 dark:text-gray-100
                      ">
                        음성으로 읽기
                      </h3>
                      <p className="
                        text-xs sm:text-sm
                        text-gray-500 dark:text-gray-400
                      ">
                        {isPlaying ? '읽는 중...' : isPaused ? '일시정지됨' : '블로그 글을 음성으로 들을 수 있습니다'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating 버튼 그룹 */}
          <div className="
            flex flex-col gap-2
            items-end
          ">
            {/* 닫기 버튼 (전체 패널이 열려있을 때만 표시) */}
            {showFullPanel && (
              <button
                onClick={() => setShowFullPanel(false)}
                className="
                  w-10 h-10
                  rounded-full
                  bg-white dark:bg-gray-800
                  shadow-lg dark:shadow-gray-900/70
                  border border-gray-200 dark:border-gray-700
                  flex items-center justify-center
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-all duration-300
                  hover:scale-110
                  active:scale-95
                "
                aria-label="패널 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* 메인 컨트롤 버튼 */}
            <div className="
              flex items-center gap-2
              bg-white dark:bg-gray-800
              rounded-full
              shadow-xl dark:shadow-gray-900/70
              border border-gray-200 dark:border-gray-700
              p-2
            ">
              <button
                onClick={isPaused ? handlePlay : handlePause}
                className="
                  w-12 h-12 sm:w-14 sm:h-14
                  rounded-full
                  bg-emerald-500 hover:bg-emerald-600
                  dark:bg-emerald-600 dark:hover:bg-emerald-500
                  text-white
                  flex items-center justify-center
                  transition-all duration-300
                  hover:shadow-lg
                  active:scale-95
                "
                aria-label={isPaused ? '재개' : '일시정지'}
              >
                {isPaused ? (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                ) : (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                )}
              </button>
              
              <button
                onClick={handleStop}
                className="
                  w-10 h-10 sm:w-12 sm:h-12
                  rounded-full
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-200
                  flex items-center justify-center
                  transition-all duration-300
                  active:scale-95
                "
                aria-label="중지"
              >
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* 설정 버튼 (전체 패널 열기/닫기) */}
              <button
                onClick={() => setShowFullPanel(!showFullPanel)}
                className="
                  w-10 h-10 sm:w-12 sm:h-12
                  rounded-full
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-200
                  flex items-center justify-center
                  transition-all duration-300
                  active:scale-95
                "
                aria-label="설정"
              >
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 재생 중이 아닐 때는 일반 카드 형태로 표시
  return (
    <div className="
      mb-8 p-4 sm:p-6
      bg-white dark:bg-gray-800
      rounded-2xl
      shadow-md dark:shadow-gray-900/50
      border border-gray-200 dark:border-gray-700
    ">
      {error && (
        <div className="
          mb-4 p-3
          bg-red-50 dark:bg-red-900/20
          border border-red-200 dark:border-red-800
          rounded-lg
          text-red-800 dark:text-red-200
          text-sm
        ">
          {error}
        </div>
      )}
      <div className="space-y-4">
        {/* 속도 선택 */}
        <div className="flex items-center gap-3">
          <Gauge className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <label className="
              block text-xs sm:text-sm
              font-medium
              text-gray-700 dark:text-gray-300
              mb-1.5
            ">
              읽기 속도: {speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={speechRate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setSpeechRate(newRate);
                speechRateRef.current = newRate;
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('속도 변경:', newRate, 'x', '(재생 중:', isPlaying, ')');
                }
                
                if ((isPlaying || isPaused) && textPartsRef.current.length > 0) {
                  isRateChangingRef.current = true;
                  
                  if (synthRef.current) {
                    synthRef.current.cancel();
                  }
                  
                  timeoutIdsRef.current.forEach(id => clearTimeout(id));
                  timeoutIdsRef.current = [];
                  
                  const currentPlayingIndex = currentPlayingIndexRef.current >= 0 
                    ? currentPlayingIndexRef.current 
                    : Math.max(0, currentIndexRef.current);
                  
                  let textToContinue = '';
                  let startIndex = currentPlayingIndex;
                  
                  if (isBoundarySupportedRef.current && currentCharIndexRef.current > 0) {
                    const fullText = textPartsRef.current.join(' ');
                    textToContinue = fullText.substring(currentCharIndexRef.current);
                    
                    let charCount = 0;
                    for (let i = 0; i < textPartsRef.current.length; i++) {
                      const sentenceLength = textPartsRef.current[i].length;
                      if (charCount + sentenceLength > currentCharIndexRef.current) {
                        startIndex = i;
                        break;
                      }
                      charCount += sentenceLength + 1;
                    }
                  } else {
                    const remainingSentences = textPartsRef.current.slice(currentPlayingIndex);
                    textToContinue = remainingSentences.join(' ');
                  }
                  
                  if (synthRef.current && textToContinue.trim().length > 0) {
                    const selectedVoice = getBestKoreanVoice();
                    const nextUtterance = new SpeechSynthesisUtterance(textToContinue);
                    nextUtterance.lang = selectedVoice?.lang || 'ko-KR';
                    nextUtterance.voice = selectedVoice;
                    nextUtterance.rate = newRate;
                    nextUtterance.pitch = getPitchForRate(newRate);
                    nextUtterance.volume = 1.0;
                    
                    if (isBoundarySupportedRef.current) {
                      nextUtterance.onboundary = (event: SpeechSynthesisEvent) => {
                        if (event.name === 'word' || event.name === 'sentence') {
                          let totalCharIndex = 0;
                          for (let i = 0; i < startIndex; i++) {
                            if (i < textPartsRef.current.length) {
                              totalCharIndex += textPartsRef.current[i].length + 1;
                            }
                          }
                          currentCharIndexRef.current = totalCharIndex + event.charIndex;
                          
                          if (event.name === 'sentence') {
                            currentSentenceStartCharIndexRef.current = totalCharIndex + event.charIndex;
                          }
                        }
                      };
                    }
                    
                    currentIndexRef.current = startIndex;
                    currentPlayingIndexRef.current = startIndex;
                    
                    const originalPlayNextPart = playNextPartRef.current;
                    
                    nextUtterance.onstart = () => {
                      isRateChangingRef.current = false;
                      setIsPlaying(true);
                      setIsPaused(false);
                      setError(null);
                    };
                    
                    nextUtterance.onend = () => {
                      isRateChangingRef.current = false;
                      if (originalPlayNextPart) {
                        let endCharIndex = 0;
                        for (let i = 0; i <= startIndex; i++) {
                          if (i < textPartsRef.current.length) {
                            endCharIndex += textPartsRef.current[i].length;
                            if (i < startIndex) endCharIndex += 1;
                          }
                        }
                        endCharIndex += textToContinue.length;
                        
                        let nextSentenceIndex = startIndex;
                        let charCount = 0;
                        for (let i = 0; i < textPartsRef.current.length; i++) {
                          charCount += textPartsRef.current[i].length;
                          if (charCount >= endCharIndex) {
                            nextSentenceIndex = i + 1;
                            break;
                          }
                          charCount += 1;
                        }
                        
                        currentIndexRef.current = nextSentenceIndex;
                        currentPlayingIndexRef.current = nextSentenceIndex;
                        currentCharIndexRef.current = endCharIndex;
                        
                        originalPlayNextPart();
                      } else {
                        setIsPlaying(false);
                        setIsPaused(false);
                      }
                    };
                    
                    nextUtterance.onerror = (event) => {
                      isRateChangingRef.current = false;
                      handleUtteranceError(event, nextUtterance);
                    };
                    
                    utteranceRef.current = nextUtterance;
                    
                    try {
                      setIsPlaying(true);
                      setIsPaused(false);
                      setError(null);
                      synthRef.current.speak(nextUtterance);
                    } catch (err) {
                      console.error('속도 변경 시 재생 오류:', err);
                      isRateChangingRef.current = false;
                      setIsPlaying(false);
                      setIsPaused(false);
                      setError('속도 변경 중 오류가 발생했습니다.');
                    }
                  } else {
                    isRateChangingRef.current = false;
                    setIsPlaying(false);
                    setIsPaused(false);
                    setError(null);
                    textPartsRef.current = [];
                    wordPartsRef.current = [];
                    currentIndexRef.current = 0;
                    currentPlayingIndexRef.current = 0;
                    currentWordIndexRef.current = 0;
                    currentCharIndexRef.current = 0;
                    timeoutIdsRef.current = [];
                    playNextPartRef.current = null;
                  }
                }
              }}
              // 읽는 중에도 속도 변경 가능
              className="
                w-full h-2
                bg-gray-200 dark:bg-gray-700
                rounded-lg
                appearance-none
                cursor-pointer
                accent-emerald-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
              <span>3.0x</span>
              <span>4.0x</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <div>
              <h3 className="
                text-sm sm:text-base
                font-semibold
                text-gray-900 dark:text-gray-100
              ">
                음성으로 읽기
              </h3>
              <p className="
                text-xs sm:text-sm
                text-gray-500 dark:text-gray-400
              ">
                {isPlaying ? '읽는 중...' : isPaused ? '일시정지됨' : '블로그 글을 음성으로 들을 수 있습니다'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
          {isPlaying || isPaused ? (
            <>
              <button
                onClick={isPaused ? handlePlay : handlePause}
                className="
                  p-2.5 sm:p-3
                  rounded-xl
                  bg-emerald-500 hover:bg-emerald-600
                  dark:bg-emerald-600 dark:hover:bg-emerald-500
                  text-white
                  transition-all duration-300
                  hover:shadow-lg
                  active:scale-95
                "
                aria-label={isPaused ? '재개' : '일시정지'}
              >
                {isPaused ? (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <button
                onClick={handleStop}
                className="
                  p-2.5 sm:p-3
                  rounded-xl
                  bg-gray-100 hover:bg-gray-200
                  dark:bg-gray-700 dark:hover:bg-gray-600
                  text-gray-700 dark:text-gray-200
                  transition-all duration-300
                  active:scale-95
                "
                aria-label="중지"
              >
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={handlePlay}
              className="
                px-4 py-2.5 sm:px-6 sm:py-3
                rounded-xl
                bg-emerald-500 hover:bg-emerald-600
                dark:bg-emerald-600 dark:hover:bg-emerald-500
                text-white
                font-medium
                text-sm sm:text-base
                transition-all duration-300
                hover:shadow-lg hover:-translate-y-0.5
                active:scale-98
                flex items-center gap-2
              "
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">읽기 시작</span>
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

