'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';

interface DateRangeFilterProps {
  baseUrl: string;
}

export default function DateRangeFilter({ baseUrl }: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState(searchParams.get('toDate') || '');

  // URL 파라미터가 변경되면 상태 업데이트
  useEffect(() => {
    setFromDate(searchParams.get('fromDate') || '');
    setToDate(searchParams.get('toDate') || '');
  }, [searchParams]);

  // 빠른 선택 옵션
  const quickOptions = [
    { label: '최근 1주일', days: 7 },
    { label: '최근 1개월', days: 30 },
    { label: '최근 3개월', days: 90 },
    { label: '최근 6개월', days: 180 },
    { label: '최근 1년', days: 365 },
  ];

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 빠른 선택 버튼 클릭
  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    
    const fromDateStr = from.toISOString().split('T')[0];
    const toDateStr = today.toISOString().split('T')[0];
    
    setFromDate(fromDateStr);
    setToDate(toDateStr);
    
    // URL 업데이트 (모든 기존 파라미터 유지)
    const params = new URLSearchParams(searchParams.toString());
    params.set('fromDate', fromDateStr);
    params.set('toDate', toDateStr);
    params.set('page', '1'); // 페이지를 1로 리셋
    
    router.push(`${baseUrl}?${params.toString()}`);
    setIsOpen(false);
  };

  // 필터 적용
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (fromDate) {
      params.set('fromDate', fromDate);
    } else {
      params.delete('fromDate');
    }
    
    if (toDate) {
      params.set('toDate', toDate);
    } else {
      params.delete('toDate');
    }
    
    params.set('page', '1'); // 페이지를 1로 리셋
    
    router.push(`${baseUrl}?${params.toString()}`);
    setIsOpen(false);
  };

  // 필터 초기화
  const handleReset = () => {
    setFromDate('');
    setToDate('');
    
    const params = new URLSearchParams(searchParams.toString());
    params.delete('fromDate');
    params.delete('toDate');
    params.set('page', '1'); // 페이지를 1로 리셋
    
    router.push(`${baseUrl}?${params.toString()}`);
    setIsOpen(false);
  };

  // 필터가 적용되어 있는지 확인
  const hasActiveFilter = fromDate || toDate;

  return (
    <div className="mb-6">
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-full sm:w-auto
          flex items-center justify-between gap-2
          px-4 py-2.5 rounded-xl
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-300
          hover:bg-emerald-50 dark:hover:bg-gray-700
          transition-all duration-300
          font-medium text-sm
        "
      >
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-500 dark:text-emerald-400" />
          <span>기간 설정</span>
          {hasActiveFilter && (
            <span className="
              px-2 py-0.5 rounded-full text-xs
              bg-emerald-100 dark:bg-emerald-900/30
              text-emerald-800 dark:text-emerald-400
            ">
              적용됨
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {/* 필터 패널 */}
      {isOpen && (
        <div className="
          mt-3 p-6 rounded-2xl
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          shadow-md dark:shadow-gray-900/50
        ">
          {/* 빠른 선택 버튼 */}
          <div className="mb-6">
            <label className="
              block text-sm font-medium
              text-gray-700 dark:text-gray-300
              mb-3
            ">
              빠른 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {quickOptions.map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleQuickSelect(option.days)}
                  className="
                    px-4 py-2 rounded-xl text-sm font-medium
                    bg-gray-100 dark:bg-gray-700
                    text-gray-700 dark:text-gray-300
                    hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                    hover:text-emerald-700 dark:hover:text-emerald-400
                    transition-all duration-300
                  "
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 날짜 선택 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="fromDate"
                className="
                  block text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  mb-2
                "
              >
                시작일
              </label>
              <input
                type="date"
                id="fromDate"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={toDate || getToday()}
                className="
                  w-full px-4 py-2.5
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none
                  focus:ring-2 focus:ring-emerald-500
                  dark:focus:ring-emerald-400
                  focus:ring-offset-2
                  transition-colors duration-150
                "
              />
            </div>
            <div>
              <label
                htmlFor="toDate"
                className="
                  block text-sm font-medium
                  text-gray-700 dark:text-gray-300
                  mb-2
                "
              >
                종료일
              </label>
              <input
                type="date"
                id="toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                max={getToday()}
                className="
                  w-full px-4 py-2.5
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  focus:outline-none
                  focus:ring-2 focus:ring-emerald-500
                  dark:focus:ring-emerald-400
                  focus:ring-offset-2
                  transition-colors duration-150
                "
              />
            </div>
          </div>

          {/* 적용된 필터 표시 */}
          {hasActiveFilter && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <div className="text-sm text-emerald-800 dark:text-emerald-300">
                  <span className="font-medium">적용된 기간:</span>{' '}
                  {fromDate && toDate ? (
                    <>
                      {fromDate} ~ {toDate}
                    </>
                  ) : fromDate ? (
                    <>
                      {fromDate} 이후
                    </>
                  ) : (
                    <>
                      {toDate} 이전
                    </>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="
                    p-1 rounded-lg
                    text-emerald-600 dark:text-emerald-400
                    hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                    transition-colors duration-150
                  "
                  aria-label="필터 초기화"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              className="
                flex-1 px-4 py-2.5 rounded-xl
                bg-emerald-500 hover:bg-emerald-600
                dark:bg-emerald-600 dark:hover:bg-emerald-500
                text-white font-medium
                shadow-md hover:shadow-lg
                transition-all duration-300
                hover:-translate-y-0.5
              "
            >
              적용
            </button>
            <button
              onClick={handleReset}
              className="
                px-4 py-2.5 rounded-xl
                bg-gray-100 hover:bg-gray-200
                dark:bg-gray-700 dark:hover:bg-gray-600
                text-gray-700 dark:text-gray-300
                font-medium
                transition-colors duration-300
              "
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

