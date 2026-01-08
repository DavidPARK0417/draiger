'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, Plus, X, Bell, BellOff, Volume2, Trash2, Edit2, Play, Pause, RotateCcw, Flag } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// 알람 인터페이스
interface Alarm {
  id: string;
  time: string; // HH:mm 형식
  label: string;
  sound: string;
  enabled: boolean;
  createdAt: string;
}

// 알람음 옵션 (Web Audio API로 생성하거나 외부 파일 사용)
const ALARM_SOUNDS = [
  { value: 'default', label: '기본 알람음', frequency: 800 },
  { value: 'gentle', label: '부드러운 알람음', frequency: 600 },
  { value: 'urgent', label: '긴급 알람음', frequency: 1000 },
  { value: 'chime', label: '차임벨', frequency: 523 }, // C5
  { value: 'beep', label: '삐삐 소리', frequency: 440 }, // A4
  { value: 'bell', label: '벨 소리', frequency: 659 }, // E5
  { value: 'alert', label: '경고음', frequency: 880 }, // A5
];

const STORAGE_KEY = 'alarm-clock-alarms';
const STOPWATCH_STORAGE_KEY = 'alarm-clock-stopwatch';
const TIMER_STORAGE_KEY = 'alarm-clock-timer';

// 스톱워치 랩 타임 인터페이스
interface LapTime {
  id: string;
  time: number; // 밀리초
  displayTime: string; // "00:00:00.000"
  createdAt: string;
}

// 타이머 상태 인터페이스
interface TimerState {
  isRunning: boolean;
  initialTime: number; // 밀리초 (설정된 시간)
  remainingTime: number; // 밀리초 (남은 시간)
  startTime: number | null; // 시작 시각
  sound: string; // 알림음
  autoReset: boolean; // 자동 리셋
  showProgress: boolean; // 진행률 표시
  repeatAlarm: boolean; // 반복 알림
  repeatInterval: number; // 반복 간격 (초)
}

// 타이머 프리셋 옵션
const TIMER_PRESETS = [
  { label: '1분', value: 60 * 1000 },
  { label: '5분', value: 5 * 60 * 1000 },
  { label: '10분', value: 10 * 60 * 1000 },
  { label: '15분', value: 15 * 60 * 1000 },
  { label: '30분', value: 30 * 60 * 1000 },
  { label: '1시간', value: 60 * 60 * 1000 },
];

export default function AlarmClockPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  // Hydration 오류 방지: 초기값을 null로 설정하고 클라이언트에서만 시간 표시
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [editingAlarmId, setEditingAlarmId] = useState<string | null>(null);
  const [newAlarm, setNewAlarm] = useState({
    time: '',
    label: '',
    sound: 'default',
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const audioContextRef = useRef<AudioContext | null>(null);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // 스톱워치 상태
  const [stopwatch, setStopwatch] = useState({
    isRunning: false,
    startTime: null as number | null,
    elapsedTime: 0, // 밀리초
    lapTimes: [] as LapTime[],
  });
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 상태
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    initialTime: 10 * 60 * 1000, // 기본 10분
    remainingTime: 10 * 60 * 1000,
    startTime: null,
    sound: 'default',
    autoReset: false,
    showProgress: true,
    repeatAlarm: false,
    repeatInterval: 30, // 30초마다 반복
  });

  const [timerMode, setTimerMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const repeatAlarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 현재 시간 업데이트 (1초마다) - 클라이언트에서만 실행
  useEffect(() => {
    // 클라이언트에서만 시간 설정 (Hydration 오류 방지)
    setCurrentTime(new Date());
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 알람 데이터 로드
  useEffect(() => {
    const savedAlarms = localStorage.getItem(STORAGE_KEY);
    if (savedAlarms) {
      try {
        const parsed = JSON.parse(savedAlarms);
        setAlarms(parsed);
        console.log('✅ [알람시계] 저장된 알람 로드:', parsed.length, '개');
      } catch (error) {
        console.error('❌ [알람시계] 알람 로드 오류:', error);
      }
    }
  }, []);

  // 알람 데이터 저장
  useEffect(() => {
    if (alarms.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
      console.log('💾 [알람시계] 알람 저장:', alarms.length, '개');
    }
  }, [alarms]);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
          console.log('🔔 [알람시계] 알림 권한:', permission);
        });
      }
    }
  }, []);

  // AudioContext 초기화
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 알람음 재생
  const playAlarmSound = useCallback((soundType: string) => {
    if (!audioContextRef.current) return;

    const soundOption = ALARM_SOUNDS.find((s) => s.value === soundType) || ALARM_SOUNDS[0];
    const audioContext = audioContextRef.current;

    // 오실레이터 노드 생성
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = soundOption.frequency;
    oscillator.type = soundType === 'gentle' ? 'sine' : 'square';

    // 부드러운 시작과 끝
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // 3번 반복
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.frequency.value = soundOption.frequency;
      oscillator2.type = soundType === 'gentle' ? 'sine' : 'square';
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode2.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.5);
    }, 600);

    setTimeout(() => {
      const oscillator3 = audioContext.createOscillator();
      const gainNode3 = audioContext.createGain();
      oscillator3.connect(gainNode3);
      gainNode3.connect(audioContext.destination);
      oscillator3.frequency.value = soundOption.frequency;
      oscillator3.type = soundType === 'gentle' ? 'sine' : 'square';
      gainNode3.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode3.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode3.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      oscillator3.start(audioContext.currentTime);
      oscillator3.stop(audioContext.currentTime + 0.5);
    }, 1200);
  }, []);

  // 알람 트리거
  const triggerAlarm = useCallback((alarm: Alarm) => {
    console.log('⏰ [알람시계] 알람 울림:', alarm);

    // 브라우저 알림
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alarm.label || '알람', {
        body: `설정한 시간 ${alarm.time}입니다.`,
        icon: '/favicon.ico',
        tag: alarm.id,
      });
    }

    // 알람음 재생
    playAlarmSound(alarm.sound);

    // 알람 자동 비활성화 (한 번만 울리도록)
    setAlarms((prev) =>
      prev.map((a) => (a.id === alarm.id ? { ...a, enabled: false } : a))
    );
    console.log('🔄 [알람시계] 알람 자동 비활성화:', alarm.id);
  }, [playAlarmSound]);

  // 알람음 미리보기
  const previewSound = useCallback((soundType: string) => {
    playAlarmSound(soundType);
    console.log('🔊 [알람시계] 알람음 미리보기:', soundType);
  }, [playAlarmSound]);

  // 알람 체크 (1초마다)
  useEffect(() => {
    if (!currentTime) return; // currentTime이 null이면 체크하지 않음
    
    const checkAlarms = () => {
      const now = currentTime;
      const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        // 같은 분에 여러 번 트리거되는 것을 방지
        const alarmKey = `${alarm.id}-${currentTimeString}`;
        if (triggeredAlarmsRef.current.has(alarmKey)) return;

        if (alarm.time === currentTimeString) {
          triggeredAlarmsRef.current.add(alarmKey);
          triggerAlarm(alarm);
          
          // 1분 후 트리거 기록 제거 (다음 분에 다시 울릴 수 있도록)
          setTimeout(() => {
            triggeredAlarmsRef.current.delete(alarmKey);
          }, 60000);
        }
      });
    };

    checkAlarms();
  }, [currentTime, alarms, triggerAlarm]);

  // 알람 추가
  const handleAddAlarm = useCallback(() => {
    if (!newAlarm.time) {
      alert('시간을 입력해주세요.');
      return;
    }

    const alarm: Alarm = {
      id: Date.now().toString(),
      time: newAlarm.time,
      label: newAlarm.label || '알람',
      sound: newAlarm.sound,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    setAlarms((prev) => [...prev, alarm].sort((a, b) => a.time.localeCompare(b.time)));
    setNewAlarm({ time: '', label: '', sound: 'default' });
    setIsAddingAlarm(false);
    console.log('✅ [알람시계] 알람 추가:', alarm);
  }, [newAlarm]);

  // 알람 수정
  const handleEditAlarm = useCallback((alarm: Alarm) => {
    setEditingAlarmId(alarm.id);
    setNewAlarm({
      time: alarm.time,
      label: alarm.label,
      sound: alarm.sound,
    });
    setIsAddingAlarm(true);
  }, []);

  // 알람 수정 저장
  const handleSaveEdit = useCallback(() => {
    if (!editingAlarmId || !newAlarm.time) {
      alert('시간을 입력해주세요.');
      return;
    }

    setAlarms((prev) =>
      prev
        .map((a) =>
          a.id === editingAlarmId
            ? { ...a, time: newAlarm.time, label: newAlarm.label, sound: newAlarm.sound }
            : a
        )
        .sort((a, b) => a.time.localeCompare(b.time))
    );

    setEditingAlarmId(null);
    setNewAlarm({ time: '', label: '', sound: 'default' });
    setIsAddingAlarm(false);
    console.log('✏️ [알람시계] 알람 수정:', editingAlarmId);
  }, [editingAlarmId, newAlarm]);

  // 알람 삭제
  const handleDeleteAlarm = useCallback((id: string) => {
    if (confirm('이 알람을 삭제하시겠습니까?')) {
      setAlarms((prev) => prev.filter((a) => a.id !== id));
      console.log('🗑️ [알람시계] 알람 삭제:', id);
    }
  }, []);

  // 알람 활성화/비활성화
  const handleToggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
    console.log('🔄 [알람시계] 알람 토글:', id);
  }, []);

  // 알람 취소
  const handleCancelEdit = useCallback(() => {
    setEditingAlarmId(null);
    setNewAlarm({ time: '', label: '', sound: 'default' });
    setIsAddingAlarm(false);
  }, []);

  // 현재 시간 포맷
  const formatTime = (date: Date | null) => {
    if (!date) return '00:00:00';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  // 현재 날짜 포맷
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // 타이머 시간 포맷 (밀리초 → HH:MM:SS 또는 MM:SS)
  const formatTimerTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // 1시간 이상이면 HH:MM:SS 형식으로 표시
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    // 1시간 미만이면 MM:SS 형식으로 표시
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  // 스톱워치 시간 포맷 (밀리초 → HH:MM:SS.mmm 또는 MM:SS.mmm)
  // 시간 제한 없음 - JavaScript Number 최대값까지 가능 (약 285,616년)
  const formatStopwatchTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10); // 10ms 단위

    // 1시간 이상이면 HH:MM:SS.mmm 형식 (시간 자릿수 제한 없음)
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }
    // 1시간 미만이면 MM:SS.mmm 형식
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  }, []);

  // 스톱워치 시간 업데이트
  useEffect(() => {
    if (stopwatch.isRunning && stopwatch.startTime !== null) {
      stopwatchIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - stopwatch.startTime! + stopwatch.elapsedTime;
        setDisplayTime(formatStopwatchTime(elapsed));
      }, 10); // 10ms마다 업데이트

      return () => {
        if (stopwatchIntervalRef.current) {
          clearInterval(stopwatchIntervalRef.current);
          stopwatchIntervalRef.current = null;
        }
      };
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
      // 일시정지 상태일 때 현재 경과 시간 표시
      setDisplayTime(formatStopwatchTime(stopwatch.elapsedTime));
    }
  }, [stopwatch.isRunning, stopwatch.startTime, stopwatch.elapsedTime, formatStopwatchTime]);

  // 스톱워치 데이터 로드
  useEffect(() => {
    const savedStopwatch = localStorage.getItem(STOPWATCH_STORAGE_KEY);
    if (savedStopwatch) {
      try {
        const parsed = JSON.parse(savedStopwatch);
        setStopwatch(parsed);
        console.log('✅ [스톱워치] 저장된 상태 로드');
      } catch (error) {
        console.error('❌ [스톱워치] 상태 로드 오류:', error);
      }
    }
  }, []);

  // 스톱워치 데이터 저장
  useEffect(() => {
    if (stopwatch.elapsedTime > 0 || stopwatch.lapTimes.length > 0 || localStorage.getItem(STOPWATCH_STORAGE_KEY)) {
      localStorage.setItem(STOPWATCH_STORAGE_KEY, JSON.stringify(stopwatch));
      console.log('💾 [스톱워치] 상태 저장');
    }
  }, [stopwatch]);

  // 스톱워치 시작/일시정지
  const handleStartStopwatch = useCallback(() => {
    if (stopwatch.isRunning) {
      // 일시정지
      setStopwatch((prev) => ({
        ...prev,
        isRunning: false,
        elapsedTime: prev.startTime ? Date.now() - prev.startTime + prev.elapsedTime : prev.elapsedTime,
        startTime: null,
      }));
      console.log('⏸️ [스톱워치] 일시정지');
    } else {
      // 시작
      setStopwatch((prev) => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
      console.log('▶️ [스톱워치] 시작');
    }
  }, [stopwatch.isRunning, stopwatch.startTime, stopwatch.elapsedTime]);

  // 스톱워치 리셋
  const handleResetStopwatch = useCallback(() => {
    if (confirm('스톱워치를 리셋하시겠습니까? 모든 랩 타임이 삭제됩니다.')) {
      setStopwatch({
        isRunning: false,
        startTime: null,
        elapsedTime: 0,
        lapTimes: [],
      });
      console.log('🔄 [스톱워치] 리셋');
    }
  }, []);

  // 랩 타임 기록
  const handleLapTime = useCallback(() => {
    if (!stopwatch.isRunning) return;

    const now = Date.now();
    const elapsed = stopwatch.startTime ? now - stopwatch.startTime + stopwatch.elapsedTime : stopwatch.elapsedTime;
    const displayTime = formatStopwatchTime(elapsed);

    const lapTime: LapTime = {
      id: Date.now().toString(),
      time: elapsed,
      displayTime,
      createdAt: new Date().toISOString(),
    };

    setStopwatch((prev) => ({
      ...prev,
      lapTimes: [lapTime, ...prev.lapTimes], // 최신순으로 추가
    }));
    console.log('🏁 [스톱워치] 랩 타임 기록:', displayTime);
  }, [stopwatch.isRunning, stopwatch.startTime, stopwatch.elapsedTime, formatStopwatchTime]);

  // 랩 타임 삭제
  const handleDeleteLapTime = useCallback((id: string) => {
    setStopwatch((prev) => ({
      ...prev,
      lapTimes: prev.lapTimes.filter((lap) => lap.id !== id),
    }));
    console.log('🗑️ [스톱워치] 랩 타임 삭제:', id);
  }, []);

  // 스톱워치 디스플레이 시간 (실시간 업데이트)
  const [displayTime, setDisplayTime] = useState('00:00.00');

  // 스톱워치 초기 디스플레이 시간 설정
  useEffect(() => {
    if (!stopwatch.isRunning) {
      setDisplayTime(formatStopwatchTime(stopwatch.elapsedTime));
    }
  }, [stopwatch.elapsedTime, stopwatch.isRunning, formatStopwatchTime]);

  // 타이머 진행률 계산
  const getTimerProgress = useCallback(() => {
    if (timer.initialTime === 0) return 100;
    return ((timer.initialTime - timer.remainingTime) / timer.initialTime) * 100;
  }, [timer.initialTime, timer.remainingTime]);

  // 타이머 프리셋 클릭
  const handlePresetClick = useCallback((value: number) => {
    const minutes = Math.floor(value / 60000);
    const seconds = Math.floor((value % 60000) / 1000);
    setTimerMinutes(minutes);
    setTimerSeconds(seconds);
    setTimer((prev) => ({
      ...prev,
      initialTime: value,
      remainingTime: value,
    }));
    console.log('⏱️ [타이머] 프리셋 설정:', minutes, '분', seconds, '초');
  }, []);

  // 타이머 시간 설정
  const handleSetTimerTime = useCallback((minutes: number, seconds: number) => {
    const totalMs = minutes * 60 * 1000 + seconds * 1000;
    setTimer((prev) => ({
      ...prev,
      initialTime: totalMs,
      remainingTime: totalMs,
    }));
  }, []);

  // 타이머 시작/일시정지
  const handleStartTimer = useCallback(() => {
    if (timer.isRunning) {
      // 일시정지
      setTimer((prev) => {
        if (!prev.startTime) return prev;
        const elapsed = Date.now() - prev.startTime;
        const newRemainingTime = Math.max(0, timerStartRemainingTimeRef.current - elapsed);
        timerStartRemainingTimeRef.current = 0;
        return {
          ...prev,
          isRunning: false,
          remainingTime: newRemainingTime,
          startTime: null,
        };
      });
      console.log('⏸️ [타이머] 일시정지');
    } else {
      // 시작
      if (timer.remainingTime <= 0) {
        alert('타이머 시간을 설정해주세요.');
        return;
      }
      timerStartRemainingTimeRef.current = timer.remainingTime;
      setTimer((prev) => ({
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }));
      console.log('▶️ [타이머] 시작');
    }
  }, [timer.isRunning, timer.startTime, timer.remainingTime]);

  // 타이머 리셋
  const handleResetTimer = useCallback(() => {
    timerStartRemainingTimeRef.current = 0;
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      remainingTime: prev.initialTime,
      startTime: null,
    }));
    console.log('🔄 [타이머] 리셋');
  }, []);

  // 타이머 시작 시점의 remainingTime 저장
  const timerStartRemainingTimeRef = useRef<number>(0);

  // 타이머 업데이트 (100ms마다)
  useEffect(() => {
    if (timer.isRunning && timer.startTime !== null) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (!prev.startTime) return prev;
          
          const elapsed = Date.now() - prev.startTime;
          const newRemainingTime = Math.max(0, timerStartRemainingTimeRef.current - elapsed);
          
          // 타이머 종료
          if (newRemainingTime <= 0) {
            // 반복 알림 정리
            if (repeatAlarmIntervalRef.current) {
              clearInterval(repeatAlarmIntervalRef.current);
              repeatAlarmIntervalRef.current = null;
            }
            
            // 알림음 재생
            playAlarmSound(prev.sound);
            
            // 브라우저 알림
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('타이머 종료', {
                body: '설정한 시간이 완료되었습니다.',
                icon: '/favicon.ico',
              });
            }
            
            // 반복 알림 설정
            if (prev.repeatAlarm) {
              repeatAlarmIntervalRef.current = setInterval(() => {
                playAlarmSound(prev.sound);
              }, prev.repeatInterval * 1000);
            }
            
            // 자동 리셋
            if (prev.autoReset) {
              timerStartRemainingTimeRef.current = prev.initialTime;
              return {
                ...prev,
                isRunning: false,
                remainingTime: prev.initialTime,
                startTime: null,
              };
            }
            
            timerStartRemainingTimeRef.current = 0;
            return {
              ...prev,
              isRunning: false,
              remainingTime: 0,
              startTime: null,
            };
          }
          
          return {
            ...prev,
            remainingTime: newRemainingTime,
            startTime: prev.startTime, // startTime 유지
          };
        });
      }, 100); // 100ms마다 업데이트 (부드러운 애니메이션)
      
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [timer.isRunning, timer.startTime, playAlarmSound]);

  // 반복 알림 정리
  useEffect(() => {
    return () => {
      if (repeatAlarmIntervalRef.current) {
        clearInterval(repeatAlarmIntervalRef.current);
        repeatAlarmIntervalRef.current = null;
      }
    };
  }, []);

  // 타이머 데이터 로드
  useEffect(() => {
    const savedTimer = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTimer) {
      try {
        const parsed = JSON.parse(savedTimer);
        setTimer(parsed);
        setTimerMinutes(Math.floor(parsed.initialTime / 60000));
        setTimerSeconds(Math.floor((parsed.initialTime % 60000) / 1000));
        console.log('✅ [타이머] 저장된 상태 로드');
      } catch (error) {
        console.error('❌ [타이머] 상태 로드 오류:', error);
      }
    }
  }, []);

  // 타이머 데이터 저장
  useEffect(() => {
    if (timer.initialTime > 0 || localStorage.getItem(TIMER_STORAGE_KEY)) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
      console.log('💾 [타이머] 상태 저장');
    }
  }, [timer]);

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
            알람시계 & 스톱워치
          </h1>
          <p
            className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-200
            max-w-2xl mx-auto
          "
          >
            알람을 설정하고 시간을 알려주는 알람시계와 경과 시간을 측정하는 스톱워치 기능입니다.
            여러 알람을 설정하고, 다양한 알람음을 선택할 수 있으며, 스톱워치로 시간을 정확하게 측정할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* 왼쪽: 현재 시간 및 알람 추가 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 현재 시간 */}
            <Card padding="md">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    현재 시간
                  </h2>
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(currentTime)}
                </div>
              </div>
            </Card>

            {/* 알람 추가 폼 */}
            {isAddingAlarm ? (
              <Card padding="md">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {editingAlarmId ? '알람 수정' : '알람 추가'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      시간
                    </label>
                    <Input
                      type="time"
                      value={newAlarm.time}
                      onChange={(e) => setNewAlarm({ ...newAlarm, time: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      메모/라벨
                    </label>
                    <Input
                      type="text"
                      value={newAlarm.label}
                      onChange={(e) => setNewAlarm({ ...newAlarm, label: e.target.value })}
                      placeholder="예: 회의, 약속 등"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      알람음
                    </label>
                    <select
                      value={newAlarm.sound}
                      onChange={(e) => setNewAlarm({ ...newAlarm, sound: e.target.value })}
                      className="
                        w-full px-4 py-2.5
                        border border-gray-300 dark:border-gray-600
                        rounded-lg
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        focus:outline-none
                        focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                        dark:focus:ring-emerald-400
                      "
                    >
                      {ALARM_SOUNDS.map((sound) => (
                        <option key={sound.value} value={sound.value}>
                          {sound.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => previewSound(newAlarm.sound)}
                      className="
                        mt-2 w-full
                        flex items-center justify-center gap-2
                        px-4 py-2
                        bg-gray-100 dark:bg-gray-700
                        hover:bg-gray-200 dark:hover:bg-gray-600
                        text-gray-700 dark:text-gray-300
                        rounded-lg
                        transition-colors duration-200
                        text-sm
                      "
                    >
                      <Volume2 className="w-4 h-4" />
                      미리 들어보기
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      onClick={editingAlarmId ? handleSaveEdit : handleAddAlarm}
                      className="flex-1"
                    >
                      {editingAlarmId ? '수정' : '추가'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCancelEdit}
                      className="flex-1"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card padding="md">
                <Button
                  variant="primary"
                  onClick={() => setIsAddingAlarm(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  알람 추가
                </Button>
                {notificationPermission !== 'granted' && (
                  <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
                    브라우저 알림 권한을 허용하면 알람이 울릴 때 알림을 받을 수 있습니다.
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* 오른쪽: 알람시계 + 스톱워치 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 알람시계 섹션 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="w-6 h-6 text-emerald-500" />
                알람시계
              </h2>
              {alarms.length === 0 ? (
                <Card padding="md">
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      설정된 알람이 없습니다.
                      <br />
                      알람을 추가해보세요!
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {alarms.map((alarm) => (
                    <Card
                      key={alarm.id}
                      padding="md"
                      className={alarm.enabled ? '' : 'opacity-60'}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {alarm.enabled ? (
                              <Bell className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <BellOff className="w-5 h-5 text-gray-400" />
                            )}
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {alarm.time}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {alarm.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {ALARM_SOUNDS.find((s) => s.value === alarm.sound)?.label}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAlarm(alarm.id)}
                            className="
                              p-2
                              text-gray-400 hover:text-emerald-500
                              dark:text-gray-500 dark:hover:text-emerald-400
                              transition-colors
                              rounded-lg
                              hover:bg-gray-100 dark:hover:bg-gray-700
                            "
                            aria-label={alarm.enabled ? '알람 끄기' : '알람 켜기'}
                          >
                            {alarm.enabled ? (
                              <Bell className="w-5 h-5" />
                            ) : (
                              <BellOff className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditAlarm(alarm)}
                            className="
                              p-2
                              text-gray-400 hover:text-blue-500
                              dark:text-gray-500 dark:hover:text-blue-400
                              transition-colors
                              rounded-lg
                              hover:bg-gray-100 dark:hover:bg-gray-700
                            "
                            aria-label="알람 수정"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAlarm(alarm.id)}
                            className="
                              p-2
                              text-gray-400 hover:text-red-500
                              dark:text-gray-500 dark:hover:text-red-400
                              transition-colors
                              rounded-lg
                              hover:bg-gray-100 dark:hover:bg-gray-700
                            "
                            aria-label="알람 삭제"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => previewSound(alarm.sound)}
                          className="
                            flex items-center gap-1
                            px-3 py-1.5
                            text-xs
                            bg-gray-100 dark:bg-gray-700
                            hover:bg-gray-200 dark:hover:bg-gray-600
                            text-gray-700 dark:text-gray-300
                            rounded-lg
                            transition-colors duration-200
                          "
                        >
                          <Volume2 className="w-3 h-3" />
                          미리보기
                        </button>
                        <span
                          className={`
                            px-2 py-1
                            text-xs font-medium
                            rounded-full
                            ${
                              alarm.enabled
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }
                          `}
                        >
                          {alarm.enabled ? '활성' : '비활성'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 스톱워치/타이머 섹션 */}
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-emerald-500" />
                스톱워치 & 타이머
              </h2>
              
              {/* 탭 전환 */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setTimerMode('stopwatch')}
                  className={`
                    flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${timerMode === 'stopwatch'
                      ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  스톱워치
                </button>
                <button
                  onClick={() => setTimerMode('timer')}
                  className={`
                    flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-300
                    ${timerMode === 'timer'
                      ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  타이머
                </button>
              </div>

              <Card padding="md">
                {timerMode === 'stopwatch' ? (
                  <>
                {/* 스톱워치 디스플레이 */}
                <div className="text-center mb-6">
                  <div className="text-5xl sm:text-6xl lg:text-7xl font-mono font-bold text-emerald-500 dark:text-emerald-400 mb-4">
                    {displayTime}
                  </div>
                </div>

                {/* 컨트롤 버튼 */}
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <Button
                    variant={stopwatch.isRunning ? 'secondary' : 'primary'}
                    onClick={handleStartStopwatch}
                    className="min-w-[120px]"
                  >
                    {stopwatch.isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        일시정지
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        시작
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleResetStopwatch}
                    disabled={stopwatch.elapsedTime === 0 && !stopwatch.isRunning}
                    className="min-w-[120px]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    리셋
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleLapTime}
                    disabled={!stopwatch.isRunning}
                    className="min-w-[120px]"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    랩
                  </Button>
                </div>

                {/* 랩 타임 목록 */}
                {stopwatch.lapTimes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      랩 타임 ({stopwatch.lapTimes.length}개)
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stopwatch.lapTimes.map((lap, index) => (
                        <div
                          key={lap.id}
                          className="
                            flex items-center justify-between
                            p-3
                            bg-gray-50 dark:bg-gray-800
                            rounded-lg
                            border border-gray-200 dark:border-gray-700
                          "
                        >
                          <div className="flex items-center gap-3">
                            <span className="
                              w-8 h-8
                              flex items-center justify-center
                              bg-emerald-100 dark:bg-emerald-900/30
                              text-emerald-700 dark:text-emerald-300
                              font-semibold
                              rounded-full
                              text-sm
                            ">
                              {stopwatch.lapTimes.length - index}
                            </span>
                            <span className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
                              {lap.displayTime}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteLapTime(lap.id)}
                            className="
                              p-1.5
                              text-gray-400 hover:text-red-500
                              dark:text-gray-500 dark:hover:text-red-400
                              transition-colors
                              rounded-lg
                              hover:bg-gray-100 dark:hover:bg-gray-700
                            "
                            aria-label="랩 타임 삭제"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 타이머 디스플레이 */}
                <div className="text-center mb-6">
                  <div className={`
                    text-5xl sm:text-6xl lg:text-7xl font-mono font-bold mb-4
                    ${timer.remainingTime === 0 
                      ? 'text-red-500 dark:text-red-400' 
                      : 'text-emerald-500 dark:text-emerald-400'
                    }
                  `}>
                    {formatTimerTime(timer.remainingTime)}
                  </div>
                  
                  {/* 진행률 표시 (옵션) */}
                  {timer.showProgress && timer.initialTime > 0 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div
                          className="bg-emerald-500 dark:bg-emerald-400 h-3 rounded-full transition-all duration-100"
                          style={{ width: `${getTimerProgress()}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(getTimerProgress())}% 완료
                      </p>
                    </div>
                  )}
                </div>

                {/* 타이머 설정 */}
                {!timer.isRunning && (
                  <div className="mb-6 space-y-4">
                    {/* 프리셋 버튼 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        빠른 설정
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {TIMER_PRESETS.map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => handlePresetClick(preset.value)}
                            className="
                              px-3 py-2
                              bg-gray-100 dark:bg-gray-700
                              hover:bg-emerald-100 dark:hover:bg-emerald-900/30
                              text-gray-700 dark:text-gray-300
                              rounded-lg
                              transition-colors duration-200
                              text-sm font-medium
                            "
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 수동 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        직접 입력
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            분
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={timerMinutes}
                            onChange={(e) => {
                              const minutes = Math.max(0, parseInt(e.target.value) || 0);
                              setTimerMinutes(minutes);
                              handleSetTimerTime(minutes, timerSeconds);
                            }}
                            className="w-full"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            초
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={timerSeconds}
                            onChange={(e) => {
                              const seconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                              setTimerSeconds(seconds);
                              handleSetTimerTime(timerMinutes, seconds);
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 알림음 선택 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        알림음
                      </label>
                      <select
                        value={timer.sound}
                        onChange={(e) => setTimer((prev) => ({ ...prev, sound: e.target.value }))}
                        className="
                          w-full px-4 py-2.5
                          border border-gray-300 dark:border-gray-600
                          rounded-lg
                          bg-white dark:bg-gray-800
                          text-gray-900 dark:text-gray-100
                          focus:outline-none
                          focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                          dark:focus:ring-emerald-400
                        "
                      >
                        {ALARM_SOUNDS.map((sound) => (
                          <option key={sound.value} value={sound.value}>
                            {sound.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 옵션 설정 */}
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={timer.showProgress}
                          onChange={(e) => setTimer((prev) => ({ ...prev, showProgress: e.target.checked }))}
                          className="
                            w-4 h-4
                            text-emerald-500
                            border-gray-300 dark:border-gray-600
                            rounded
                            focus:ring-emerald-500 dark:focus:ring-emerald-400
                            cursor-pointer
                          "
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          진행률 표시
                        </span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={timer.autoReset}
                          onChange={(e) => setTimer((prev) => ({ ...prev, autoReset: e.target.checked }))}
                          className="
                            w-4 h-4
                            text-emerald-500
                            border-gray-300 dark:border-gray-600
                            rounded
                            focus:ring-emerald-500 dark:focus:ring-emerald-400
                            cursor-pointer
                          "
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          자동 리셋
                        </span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={timer.repeatAlarm}
                          onChange={(e) => setTimer((prev) => ({ ...prev, repeatAlarm: e.target.checked }))}
                          className="
                            w-4 h-4
                            text-emerald-500
                            border-gray-300 dark:border-gray-600
                            rounded
                            focus:ring-emerald-500 dark:focus:ring-emerald-400
                            cursor-pointer
                          "
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          반복 알림
                        </span>
                      </label>

                      {timer.repeatAlarm && (
                        <div className="ml-6">
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            반복 간격 (초)
                          </label>
                          <Input
                            type="number"
                            min="5"
                            max="300"
                            value={timer.repeatInterval}
                            onChange={(e) => {
                              const interval = Math.max(5, Math.min(300, parseInt(e.target.value) || 30));
                              setTimer((prev) => ({ ...prev, repeatInterval: interval }));
                            }}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 컨트롤 버튼 */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant={timer.isRunning ? 'secondary' : 'primary'}
                    onClick={handleStartTimer}
                    className="min-w-[120px]"
                  >
                    {timer.isRunning ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        일시정지
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        시작
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleResetTimer}
                    disabled={timer.remainingTime === timer.initialTime && !timer.isRunning}
                    className="min-w-[120px]"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    리셋
                  </Button>
                </div>
              </>
            )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

