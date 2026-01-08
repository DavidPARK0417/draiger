'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Plus, X, Zap, Briefcase } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import TimeConverter from './components/TimeConverter';
import MeetingCalculator from './components/MeetingCalculator';
import TimezoneComparisonTable from './components/TimezoneComparisonTable';
import TimeDifferenceCalculator from './components/TimeDifferenceCalculator';
import {
  TIME_ZONES,
  MAJOR_BUSINESS_CITIES,
  getCurrentTimezoneCode,
  getTimeInTimezone,
  isBusinessHours,
} from './utils/timezone';

interface CityTime {
  id: string;
  timeZone: string;
  time: string;
  date: string;
  timezoneCode: string;
  isBusinessHours: boolean;
}

export default function WorldTimeConverterPage() {
  const [selectedCities, setSelectedCities] = useState<CityTime[]>([
    { 
      id: '1', 
      timeZone: 'Asia/Seoul', 
      time: '', 
      date: '',
      timezoneCode: 'KST',
      isBusinessHours: false,
    },
  ]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // 시간 업데이트 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 선택된 도시들의 시간 계산
  useEffect(() => {
    setSelectedCities((prevCities) => {
      return prevCities.map((city) => {
        try {
          const { time, date } = getTimeInTimezone(city.timeZone, currentTime);
          const timezoneCode = getCurrentTimezoneCode(city.timeZone, currentTime);
          const isBusinessHoursNow = isBusinessHours(currentTime, city.timeZone);

          return {
            ...city,
            time,
            date,
            timezoneCode,
            isBusinessHours: isBusinessHoursNow,
          };
        } catch (error) {
          console.error('❌ [세계시간 변환] 시간 계산 오류:', error);
          return { 
            ...city, 
            time: '오류', 
            date: '오류',
            timezoneCode: 'UTC',
            isBusinessHours: false,
          };
        }
      });
    });
  }, [currentTime]);

  // 도시 추가
  const handleAddCity = useCallback(() => {
    const newCity: CityTime = {
      id: Date.now().toString(),
      timeZone: 'Asia/Seoul',
      time: '',
      date: '',
      timezoneCode: 'KST',
      isBusinessHours: false,
    };
    setSelectedCities([...selectedCities, newCity]);
    console.log('✅ [세계시간 변환] 도시 추가:', newCity.id);
  }, [selectedCities]);

  // 주요 도시 빠른 추가
  const handleAddMajorCities = useCallback(() => {
    const existingTimeZones = selectedCities.map((city) => city.timeZone);
    const citiesToAdd = MAJOR_BUSINESS_CITIES.filter(
      (tz) => !existingTimeZones.includes(tz)
    );

    if (citiesToAdd.length === 0) {
      alert('이미 모든 주요 도시가 추가되어 있습니다.');
      return;
    }

    const newCities: CityTime[] = citiesToAdd.map((timeZone) => {
      const { time, date } = getTimeInTimezone(timeZone, currentTime);
      const timezoneCode = getCurrentTimezoneCode(timeZone, currentTime);
      const isBusinessHoursNow = isBusinessHours(currentTime, timeZone);

      return {
        id: Date.now().toString() + Math.random(),
        timeZone,
        time,
        date,
        timezoneCode,
        isBusinessHours: isBusinessHoursNow,
      };
    });

    setSelectedCities([...selectedCities, ...newCities]);
    console.log('✅ [세계시간 변환] 주요 도시 추가:', citiesToAdd);
  }, [selectedCities, currentTime]);

  // 도시 제거
  const handleRemoveCity = useCallback((id: string) => {
    if (selectedCities.length <= 1) {
      alert('최소 하나의 도시는 유지해야 합니다.');
      return;
    }
    setSelectedCities(selectedCities.filter((city) => city.id !== id));
    console.log('🗑️ [세계시간 변환] 도시 제거:', id);
  }, [selectedCities]);

  // 시간대 변경
  const handleTimeZoneChange = useCallback((id: string, timeZone: string) => {
    setSelectedCities(
      selectedCities.map((city) =>
        city.id === id ? { ...city, timeZone } : city
      )
    );
    console.log('🔄 [세계시간 변환] 시간대 변경:', { id, timeZone });
  }, [selectedCities]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* 헤더 */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1
            className="
            text-2xl sm:text-3xl lg:text-4xl xl:text-5xl
            font-bold mb-4
            text-gray-900 dark:text-white dark:font-extrabold
            leading-tight
          "
          >
            세계시간 변환기
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            전 세계 주요 도시의 현재 시간을 확인하고 시간대를 변환할 수 있습니다.
            여러 도시의 시간을 동시에 비교할 수 있습니다.
          </p>
        </div>

        <div className="space-y-6">
          {/* 시간 변환기 */}
          <TimeConverter />

          {/* 미팅 시간 계산기 */}
          <MeetingCalculator />

          {/* 시간대 비교표 */}
          <TimezoneComparisonTable />

          {/* 시간 차이 계산기 */}
          <TimeDifferenceCalculator />

          {/* 주요 도시 빠른 추가 */}
          <Card padding="md">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    주요 비즈니스 도시 빠른 추가
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    서울, 뉴욕, 런던, 도쿄, 베이징, 시드니를 한 번에 추가
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleAddMajorCities}
                disabled={selectedCities.length >= 10}
              >
                <Zap className="w-4 h-4 mr-2" />
                주요 도시 추가
              </Button>
            </div>
          </Card>

          {/* 도시 목록 */}
          {selectedCities.map((city) => {
            const timeZoneInfo = TIME_ZONES.find((tz) => tz.value === city.timeZone);
            return (
              <Card 
                key={city.id} 
                padding="md"
                className={city.isBusinessHours ? 'ring-2 ring-emerald-200 dark:ring-emerald-800' : ''}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {timeZoneInfo?.city || '도시 선택'}
                      </h3>
                      {city.isBusinessHours && (
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
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Select
                        value={city.timeZone}
                        onChange={(e) => handleTimeZoneChange(city.id, e.target.value)}
                      >
                        {TIME_ZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label} - {tz.city}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      시간대: {city.timezoneCode}
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-bold text-emerald-500 dark:text-emerald-400 mb-1">
                      {city.time || '--:--:--'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {city.date || '날짜 로딩 중...'}
                    </div>
                  </div>
                  {selectedCities.length > 1 && (
                    <button
                      onClick={() => handleRemoveCity(city.id)}
                      className="
                        p-2
                        text-gray-400 hover:text-red-500
                        dark:text-gray-500 dark:hover:text-red-400
                        transition-colors
                        rounded-lg
                        hover:bg-gray-100 dark:hover:bg-gray-700
                      "
                      aria-label="도시 제거"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}

          {/* 도시 추가 버튼 */}
          <div className="flex justify-center">
            <Button
              variant="secondary"
              onClick={handleAddCity}
              disabled={selectedCities.length >= 10}
            >
              <Plus className="w-4 h-4 mr-2" />
              도시 추가 {selectedCities.length >= 10 && '(최대 10개)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

