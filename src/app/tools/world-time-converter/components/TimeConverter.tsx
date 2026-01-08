'use client';

import { useState, useCallback } from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { TIME_ZONES, getTimeInTimezone, getCurrentTimezoneCode } from '../utils/timezone';

/**
 * 시간 변환기 컴포넌트
 * 
 * 특정 시간을 다른 시간대로 변환하는 기능을 제공합니다.
 */
export default function TimeConverter() {
  const [fromTimezone, setFromTimezone] = useState('Asia/Seoul');
  const [toTimezone, setToTimezone] = useState('America/New_York');
  const [dateTime, setDateTime] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
  });
  const [convertedResult, setConvertedResult] = useState<{
    time: string;
    date: string;
    timezoneCode: string;
  } | null>(null);

  // 시간 변환 실행
  const handleConvert = useCallback(() => {
    try {
      // 날짜와 시간을 결합하여 Date 객체 생성
      const dateTimeString = `${dateTime.date}T${dateTime.time}:00`;
      
      // 입력된 시간을 출발 시간대의 시간으로 해석
      // 출발 시간대의 시간을 UTC로 변환하기 위해
      // 입력된 날짜/시간을 UTC로 해석하고 오프셋을 조정
      const [year, month, day] = dateTime.date.split('-').map(Number);
      const [hour, minute] = dateTime.time.split(':').map(Number);

      // 출발 시간대의 시간을 UTC로 변환
      // 출발 시간대에서의 시간을 UTC로 변환하는 정확한 방법
      // 임시 Date 객체를 생성하여 출발 시간대의 시간을 UTC로 변환
      const tempDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
      
      // 출발 시간대의 시간을 UTC로 변환
      // 출발 시간대에서의 시간을 UTC로 변환하기 위해 오프셋 계산
      const fromTimeInUTC = new Date(
        tempDate.toLocaleString('en-US', { timeZone: fromTimezone })
      );
      const fromTimeInLocal = new Date(
        tempDate.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const offsetDiff = fromTimeInLocal.getTime() - fromTimeInUTC.getTime();
      
      // UTC 시간 계산
      const utcTime = new Date(tempDate.getTime() - offsetDiff);

      // 목적지 시간대의 시간 계산
      const result = getTimeInTimezone(toTimezone, utcTime);
      const timezoneCode = getCurrentTimezoneCode(toTimezone, utcTime);

      setConvertedResult({
        time: result.time,
        date: result.date,
        timezoneCode,
      });

      console.log('✅ [시간 변환] 변환 완료:', {
        from: fromTimezone,
        to: toTimezone,
        input: dateTimeString,
        result,
      });
    } catch (error) {
      console.error('❌ [시간 변환] 오류:', error);
      // 간단한 방법으로 재시도
      try {
        const dateTimeString = `${dateTime.date}T${dateTime.time}:00`;
        const inputDate = new Date(dateTimeString);
        const result = getTimeInTimezone(toTimezone, inputDate);
        const timezoneCode = getCurrentTimezoneCode(toTimezone, inputDate);

        setConvertedResult({
          time: result.time,
          date: result.date,
          timezoneCode,
        });
      } catch (fallbackError) {
        console.error('❌ [시간 변환] 폴백 오류:', fallbackError);
        alert('시간 변환 중 오류가 발생했습니다.');
      }
    }
  }, [dateTime, fromTimezone, toTimezone]);

  return (
    <Card padding="lg">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            시간 변환기
          </h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          특정 시간을 다른 시간대로 변환할 수 있습니다.
        </p>

        {/* 입력 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 출발 시간대 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              출발 시간대
            </label>
            <Select
              value={fromTimezone}
              onChange={(e) => setFromTimezone(e.target.value)}
            >
              {TIME_ZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.city} ({tz.code})
                </option>
              ))}
            </Select>
          </div>

          {/* 목적지 시간대 */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              목적지 시간대
            </label>
            <Select
              value={toTimezone}
              onChange={(e) => setToTimezone(e.target.value)}
            >
              {TIME_ZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.city} ({tz.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* 날짜/시간 입력 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4" />
              날짜
            </label>
            <Input
              type="date"
              value={dateTime.date}
              onChange={(e) =>
                setDateTime({ ...dateTime, date: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Clock className="w-4 h-4" />
              시간
            </label>
            <Input
              type="time"
              value={dateTime.time}
              onChange={(e) =>
                setDateTime({ ...dateTime, time: e.target.value })
              }
            />
          </div>
        </div>

        {/* 변환 버튼 */}
        <Button onClick={handleConvert} fullWidth>
          <ArrowRight className="w-4 h-4 mr-2" />
          시간 변환하기
        </Button>

        {/* 변환 결과 */}
        {convertedResult && (
          <Card padding="md" variant="3d">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                변환된 시간 ({convertedResult.timezoneCode})
              </p>
              <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">
                {convertedResult.time}
              </div>
              <div className="text-lg text-gray-700 dark:text-gray-300">
                {convertedResult.date}
              </div>
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}

