"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: string | Date;
  className?: string;
}

/**
 * 날짜를 포맷팅하는 클라이언트 컴포넌트
 * Hydration 오류를 방지하기 위해 클라이언트에서만 포맷팅을 수행합니다.
 */
export default function FormattedDate({ date, className }: FormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // 클라이언트에서만 날짜 포맷팅 수행 (Hydration 오류 방지)
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const formatted = dateObj.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    setFormattedDate(formatted);
  }, [date]);

  // 서버 렌더링 시에는 빈 문자열을 반환하고, 클라이언트에서 채워집니다
  return (
    <time className={className} suppressHydrationWarning>
      {formattedDate || ""}
    </time>
  );
}

