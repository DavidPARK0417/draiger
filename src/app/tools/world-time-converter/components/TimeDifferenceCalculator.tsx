'use client';

import { useState, useCallback } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  TIME_ZONES,
  getTimezoneOffset,
  getTimeInTimezone,
} from '../utils/timezone';

/**
 * 시간 차이 계산기 컴포넌트
 * 
 * 두 도시 간의 시간 차이를 계산하고 표시합니다.
 */
export default function TimeDifferenceCalculator() {
  const [city1, setCity1] = useState('Asia/Seoul');
  const [city2, setCity2] = useState('America/New_York');
  const [difference, setDifference] = useState<{
    hours: number;
    minutes: number;
    isAhead: boolean;
    description: string;
  } | null>(null);

  // 시간 차이 계산
  const handleCalculate = useCallback(() => {
    try {
      const now = new Date();
      const offset = getTimezoneOffset(city1, city2, now);
      
      const hours = Math.abs(offset);
      const minutes = 0; // 시간 단위로만 계산
      const isAhead = offset > 0;

      const city1Info = TIME_ZONES.find((tz) => tz.value === city1);
      const city2Info = TIME_ZONES.find((tz) => tz.value === city2);

      const city1Name = city1Info?.city || city1;
      const city2Name = city2Info?.city || city2;

      const description = isAhead
        ? `${city1Name}은 ${city2Name}보다 ${hours}시간 빠릅니다.`
        : `${city1Name}은 ${city2Name}보다 ${hours}시간 늦습니다.`;

      setDifference({
        hours,
        minutes,
        isAhead,
        description,
      });

      console.log('✅ [시간 차이 계산] 계산 완료:', {
        city1,
        city2,
        offset,
        difference: { hours, minutes, isAhead },
      });
    } catch (error) {
      console.error('❌ [시간 차이 계산] 오류:', error);
      alert('시간 차이 계산 중 오류가 발생했습니다.');
    }
  }, [city1, city2]);

  const city1Info = TIME_ZONES.find((tz) => tz.value === city1);
  const city2Info = TIME_ZONES.find((tz) => tz.value === city2);

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            시간 차이 계산기
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          두 도시 간의 시간 차이를 계산할 수 있습니다.
        </p>

        {/* 도시 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              첫 번째 도시
            </label>
            <Select value={city1} onChange={(e) => setCity1(e.target.value)}>
              {TIME_ZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.city} ({tz.code})
                </option>
              ))}
            </Select>
            {city1Info && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                현재 시간: {getTimeInTimezone(city1, new Date()).time}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              두 번째 도시
            </label>
            <Select value={city2} onChange={(e) => setCity2(e.target.value)}>
              {TIME_ZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.city} ({tz.code})
                </option>
              ))}
            </Select>
            {city2Info && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                현재 시간: {getTimeInTimezone(city2, new Date()).time}
              </div>
            )}
          </div>
        </div>

        {/* 계산 버튼 */}
        <Button onClick={handleCalculate} fullWidth>
          <Clock className="w-4 h-4 mr-2" />
          시간 차이 계산하기
        </Button>

        {/* 결과 표시 */}
        {difference && (
          <Card padding="md" variant="3d">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {city1Info?.city}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getTimeInTimezone(city1, new Date()).time}
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-emerald-500" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {city2Info?.city}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {getTimeInTimezone(city2, new Date()).time}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">
                  {difference.isAhead ? '+' : '-'}{difference.hours}시간
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {difference.description}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}

