'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: '홈', href: '/' },
  { name: '광고 성과 계산', href: '/tools/ad-performance' },
  { name: '키워드 분석', href: '/tools/keyword-analysis' },
  { name: 'ROI 계산기', href: '/tools/roi-calculator' },
  { name: '손익분기점 계산기', href: '/tools/break-even-point' },
  { name: '광고 예산 계산기', href: '/tools/budget-calculator' },
  { name: 'CRO 계산기', href: '/tools/conversion-calculator' },
  { name: '수익성 진단', href: '/tools/profitability-diagnosis' },
  { name: '문의하기', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-gray-900 dark:text-white dark:font-semibold hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors duration-300"
            >
              마케팅 도구 모음
            </Link>
          </div>
          <nav className="flex space-x-1 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                    className={`
                    px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap 
                    transition-all duration-300
                    ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                        : 'text-gray-700 dark:text-white dark:font-semibold hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-300'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

