'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, ArrowUpDown, Briefcase } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  TIME_ZONES,
  MAJOR_BUSINESS_CITIES,
  getTimeInTimezone,
  getCurrentTimezoneCode,
  isBusinessHours,
} from '../utils/timezone';

type SortField = 'city' | 'time' | 'offset';
type SortDirection = 'asc' | 'desc';

interface ComparisonRow {
  timezone: string;
  city: string;
  time: string;
  date: string;
  timezoneCode: string;
  offset: number;
  isBusinessHours: boolean;
}

/**
 * 시간대 비교표 컴포넌트
 * 
 * 주요 도시의 현재 시간을 테이블 형태로 한눈에 비교할 수 있습니다.
 */
export default function TimezoneComparisonTable() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedCities, setSelectedCities] = useState<string[]>(MAJOR_BUSINESS_CITIES);
  const [sortField, setSortField] = useState<SortField>('city');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);

  // 시간 업데이트 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 비교 데이터 계산
  useEffect(() => {
    const data: ComparisonRow[] = selectedCities.map((timezone) => {
      const { time, date } = getTimeInTimezone(timezone, currentTime);
      const timezoneCode = getCurrentTimezoneCode(timezone, currentTime);
      const isBusinessHoursNow = isBusinessHours(currentTime, timezone);
      const timezoneInfo = TIME_ZONES.find((tz) => tz.value === timezone);
      const offset = timezoneInfo?.offset || 0;

      return {
        timezone,
        city: timezoneInfo?.city || timezone,
        time,
        date,
        timezoneCode,
        offset,
        isBusinessHours: isBusinessHoursNow,
      };
    });

    // 정렬
    const sortedData = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'city':
          comparison = a.city.localeCompare(b.city, 'ko');
          break;
        case 'time':
          comparison = a.time.localeCompare(b.time);
          break;
        case 'offset':
          comparison = a.offset - b.offset;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setComparisonData(sortedData);
  }, [selectedCities, currentTime, sortField, sortDirection]);

  // 정렬 변경
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // 도시 선택 토글
  const toggleCity = useCallback((timezone: string) => {
    setSelectedCities((prev) =>
      prev.includes(timezone)
        ? prev.filter((tz) => tz !== timezone)
        : [...prev, timezone]
    );
  }, []);

  // 모든 주요 도시 선택/해제
  const toggleAllCities = useCallback(() => {
    if (selectedCities.length === MAJOR_BUSINESS_CITIES.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities([...MAJOR_BUSINESS_CITIES]);
    }
  }, [selectedCities]);

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <Table className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            시간대 비교표
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          주요 도시의 현재 시간을 테이블 형태로 한눈에 비교할 수 있습니다.
        </p>

        {/* 도시 선택 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              비교할 도시 선택
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAllCities}
            >
              {selectedCities.length === MAJOR_BUSINESS_CITIES.length
                ? '전체 해제'
                : '전체 선택'}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {TIME_ZONES.filter((tz) => MAJOR_BUSINESS_CITIES.includes(tz.value)).map((tz) => (
              <label
                key={tz.value}
                className="
                  flex items-center gap-2
                  p-2 rounded-lg
                  cursor-pointer
                  bg-gray-50 dark:bg-gray-800
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors
                "
              >
                <input
                  type="checkbox"
                  checked={selectedCities.includes(tz.value)}
                  onChange={() => toggleCity(tz.value)}
                  className="
                    w-4 h-4
                    text-emerald-500
                    border-gray-300 dark:border-gray-600
                    rounded
                    focus:ring-emerald-500
                  "
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  {tz.city}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 비교표 */}
        {comparisonData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="
                    px-4 py-3 text-left
                    text-sm font-semibold
                    text-gray-900 dark:text-white
                    cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors
                  " onClick={() => handleSort('city')}>
                    <div className="flex items-center gap-2">
                      도시
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="
                    px-4 py-3 text-left
                    text-sm font-semibold
                    text-gray-900 dark:text-white
                    cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors
                  " onClick={() => handleSort('time')}>
                    <div className="flex items-center gap-2">
                      시간
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="
                    px-4 py-3 text-left
                    text-sm font-semibold
                    text-gray-900 dark:text-white
                  ">
                    날짜
                  </th>
                  <th className="
                    px-4 py-3 text-left
                    text-sm font-semibold
                    text-gray-900 dark:text-white
                    cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors
                  " onClick={() => handleSort('offset')}>
                    <div className="flex items-center gap-2">
                      UTC 오프셋
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </th>
                  <th className="
                    px-4 py-3 text-left
                    text-sm font-semibold
                    text-gray-900 dark:text-white
                  ">
                    상태
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr
                    key={row.timezone}
                    className="
                      border-b border-gray-100 dark:border-gray-800
                      hover:bg-gray-50 dark:hover:bg-gray-800
                      transition-colors
                    "
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {row.city}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-lg font-bold text-emerald-500 dark:text-emerald-400">
                        {row.time}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {row.timezoneCode}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {row.offset >= 0 ? '+' : ''}{row.offset}
                    </td>
                    <td className="px-4 py-3">
                      {row.isBusinessHours ? (
                        <span className="
                          inline-flex items-center gap-1
                          px-2 py-1
                          bg-emerald-100 dark:bg-emerald-900/30
                          text-emerald-700 dark:text-emerald-300
                          text-xs font-medium
                          rounded-full
                        ">
                          <Briefcase className="w-3 h-3" />
                          영업시간
                        </span>
                      ) : (
                        <span className="
                          inline-flex items-center
                          px-2 py-1
                          bg-gray-100 dark:bg-gray-700
                          text-gray-600 dark:text-gray-400
                          text-xs font-medium
                          rounded-full
                        ">
                          휴무
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            비교할 도시를 선택해주세요.
          </div>
        )}
      </div>
    </Card>
  );
}

