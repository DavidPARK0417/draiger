'use client';

import { useState, useCallback } from 'react';
import { Calendar, Clock, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  TIME_ZONES,
  MAJOR_BUSINESS_CITIES,
  getTimeInTimezone,
  getCurrentTimezoneCode,
  isBusinessHours,
} from '../utils/timezone';

/**
 * 미팅 시간 계산기 컴포넌트
 * 
 * 특정 시간에 미팅을 잡으면 각 지역 시간을 동시에 표시합니다.
 */
export default function MeetingCalculator() {
  const [meetingDate, setMeetingDate] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [baseTimezone, setBaseTimezone] = useState('Asia/Seoul');
  const [selectedCities, setSelectedCities] = useState<string[]>(MAJOR_BUSINESS_CITIES);
  const [results, setResults] = useState<Array<{
    timezone: string;
    time: string;
    date: string;
    timezoneCode: string;
    isBusinessHours: boolean;
  }>>([]);

  // 미팅 시간 계산
  const handleCalculate = useCallback(() => {
    try {
      // 날짜와 시간을 결합하여 Date 객체 생성
      const dateTimeString = `${meetingDate.date}T${meetingDate.time}:00`;
      const meetingDateTime = new Date(dateTimeString);

      // 각 선택된 도시의 시간 계산
      const calculatedResults = selectedCities.map((timezone) => {
        const { time, date } = getTimeInTimezone(timezone, meetingDateTime);
        const timezoneCode = getCurrentTimezoneCode(timezone, meetingDateTime);
        const isBusinessHoursNow = isBusinessHours(meetingDateTime, timezone);
        const timezoneInfo = TIME_ZONES.find((tz) => tz.value === timezone);

        return {
          timezone,
          city: timezoneInfo?.city || timezone,
          time,
          date,
          timezoneCode,
          isBusinessHours: isBusinessHoursNow,
        };
      });

      setResults(calculatedResults);

      console.log('✅ [미팅 시간 계산] 계산 완료:', {
        baseTimezone,
        meetingDateTime: dateTimeString,
        results: calculatedResults,
      });
    } catch (error) {
      console.error('❌ [미팅 시간 계산] 오류:', error);
      alert('미팅 시간 계산 중 오류가 발생했습니다.');
    }
  }, [meetingDate, baseTimezone, selectedCities]);

  // 도시 선택 토글
  const toggleCity = useCallback((timezone: string) => {
    setSelectedCities((prev) =>
      prev.includes(timezone)
        ? prev.filter((tz) => tz !== timezone)
        : [...prev, timezone]
    );
  }, []);

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            미팅 시간 계산기
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          특정 시간에 미팅을 잡으면 각 지역의 시간을 동시에 확인할 수 있습니다.
        </p>

        {/* 입력 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              미팅 날짜
            </label>
            <Input
              type="date"
              value={meetingDate.date}
              onChange={(e) =>
                setMeetingDate({ ...meetingDate, date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Clock className="w-4 h-4" />
              미팅 시간
            </label>
            <Input
              type="time"
              value={meetingDate.time}
              onChange={(e) =>
                setMeetingDate({ ...meetingDate, time: e.target.value })
              }
            />
          </div>
        </div>

        {/* 기준 시간대 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            기준 시간대
          </label>
          <Select
            value={baseTimezone}
            onChange={(e) => setBaseTimezone(e.target.value)}
          >
            {TIME_ZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.city} ({tz.code})
              </option>
            ))}
          </Select>
        </div>

        {/* 도시 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            표시할 도시 선택
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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

        {/* 계산 버튼 */}
        <Button onClick={handleCalculate} fullWidth>
          <Users className="w-4 h-4 mr-2" />
          미팅 시간 계산하기
        </Button>

        {/* 결과 표시 */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              각 지역의 미팅 시간
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                  <Card
                    key={result.timezone}
                    padding="md"
                    className={
                      result.isBusinessHours
                        ? 'ring-2 ring-emerald-200 dark:ring-emerald-800'
                        : ''
                    }
                  >
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {result.city}
                        </h4>
                        {result.isBusinessHours && (
                          <span className="
                            inline-flex items-center
                            px-2 py-0.5
                            bg-emerald-100 dark:bg-emerald-900/30
                            text-emerald-700 dark:text-emerald-300
                            text-xs font-medium
                            rounded-full
                          ">
                            영업시간
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                        {result.time}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.date}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {result.timezoneCode}
                      </div>
                    </div>
                  </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

