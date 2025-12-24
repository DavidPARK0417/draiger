'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <div className="flex items-center justify-between h-24 sm:h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center transition-opacity duration-300 hover:opacity-80"
            >
              {/* 모바일 모드 (640px 미만): adtoolkit.jpg만 사용 */}
              <Image
                src="/adtoolkit.jpg"
                alt="adtoolkit"
                width={427}
                height={149}
                className="block sm:hidden h-20 w-auto object-contain"
                priority
              />
              {/* 태블릿/노트북/데스크탑 모드 (640px 이상): adtoolkit_logo.jpg만 사용 */}
              <Image
                src="/adtoolkit_logo.jpg"
                alt="adtoolkit"
                width={180}
                height={50}
                className="hidden sm:block h-10 w-auto object-contain"
                priority
              />
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

