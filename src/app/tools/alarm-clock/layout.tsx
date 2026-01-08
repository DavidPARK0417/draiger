import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '알람시계 & 스톱워치',
  description: '알람을 설정하고 시간을 알려주는 알람시계와 경과 시간을 측정하는 스톱워치 기능입니다. 여러 알람을 설정하고, 다양한 알람음을 선택할 수 있으며, 스톱워치로 시간을 정확하게 측정할 수 있습니다.',
  keywords: ['알람시계', '알람', '타이머', '알림', '시간 알림', '스톱워치', '랩 타임'],
  alternates: {
    canonical: '/tools/alarm-clock',
  },
  openGraph: {
    title: '알람시계 & 스톱워치 - 시간 알림 및 측정 도구',
    description: '알람을 설정하고 시간을 알려주는 알람시계와 경과 시간을 측정하는 스톱워치 기능입니다.',
    type: 'website',
    url: '/tools/alarm-clock',
  },
  twitter: {
    card: 'summary',
    title: '알람시계 & 스톱워치 - 시간 알림 및 측정 도구',
    description: '알람을 설정하고 시간을 알려주는 알람시계와 경과 시간을 측정하는 스톱워치 기능입니다.',
  },
};

export default function AlarmClockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

