import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "사이트 소개",
  description: "드라이거 (Draiger)는 디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼입니다. AI 기반 마케팅 분석 도구, 실용적인 업무 도구, 매일 업데이트되는 전문 인사이트를 한 곳에서 제공합니다.",
  keywords: [
    "사이트 소개",
    "Draiger",
    "draiger",
    "DRAIGER",
    "드라이거",
    "데일리 툴킷",
    "Daily Toolkit",
    "마케팅 도구",
    "인사이트",
    "ROI 계산기",
    "광고 성과 분석",
    "키워드 분석",
    "마케팅 분석 도구",
    "비즈니스 솔루션",
    "AI 마케팅 분석",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "사이트 소개 - 드라이거 (Draiger)",
    description: "드라이거(Draiger)는 디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼입니다. AI 기반 분석 도구와 전문 인사이트를 제공합니다.",
    type: "website",
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "사이트 소개 - 드라이거 (Draiger)",
    description: "드라이거(Draiger)는 디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼입니다. AI 기반 분석 도구와 전문 인사이트를 제공합니다.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12">
          <h1 className="
            text-2xl sm:text-3xl lg:text-4xl
            font-bold
            text-gray-900 dark:text-gray-100
            mb-4
          ">
            사이트 소개
          </h1>
          <p className="
            text-base sm:text-lg lg:text-xl
            text-gray-600 dark:text-gray-400
            leading-relaxed
          ">
            디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="
          bg-white dark:bg-gray-800
          rounded-lg
          shadow-sm dark:shadow-gray-900/30
          border border-gray-100 dark:border-gray-700
          p-6 sm:p-8 lg:p-12
          space-y-6 sm:space-y-8
        ">
          {/* 소개 섹션 */}
          <section className="space-y-4">
            <h2 className="
              text-xl sm:text-2xl
              font-semibold
              text-gray-900 dark:text-gray-100
            ">
              드라이거 (Draiger)란?
            </h2>
            <div className="
              text-sm sm:text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
              space-y-4
            ">
              <p>
                <strong className="text-gray-900 dark:text-gray-100">드라이거 (Draiger)</strong>는 
                디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼입니다. 
                복잡한 마케팅 데이터 분석부터 일상 업무에 필요한 실용적인 도구까지, 
                전문적인 지식과 실전 도구를 한 곳에서 제공하여 더 빠르고 정확한 의사결정을 지원합니다.
              </p>
              <p>
                우리는 단순한 도구 모음집을 넘어, <strong className="text-gray-900 dark:text-gray-100">AI 기반 자동 분석</strong>과 
                <strong className="text-gray-900 dark:text-gray-100"> 매일 업데이트되는 전문 인사이트</strong>를 결합하여 
                사용자가 데이터 기반의 전략적 판단을 내릴 수 있도록 돕습니다. 
                복잡한 계산과 분석 과정을 간소화하고, 실시간으로 변화하는 시장 트렌드를 쉽게 파악할 수 있도록 설계되었습니다.
              </p>
            </div>
          </section>

          {/* 핵심 가치 섹션 */}
          <section className="space-y-4">
            <h2 className="
              text-xl sm:text-2xl
              font-semibold
              text-gray-900 dark:text-gray-100
            ">
              핵심 가치
            </h2>
            <div className="
              text-sm sm:text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
              space-y-4
            ">
              <div className="
                bg-emerald-50 dark:bg-emerald-900/20
                border-l-4 border-emerald-500
                p-4 rounded-r-lg
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-emerald-900 dark:text-emerald-100
                  mb-2
                ">
                  🎯 데이터 기반 의사결정
                </h3>
                <p>
                  추측이 아닌 정확한 데이터 분석을 통해 광고 예산, ROI, 수익성을 
                  체계적으로 평가하고 최적의 전략을 수립할 수 있습니다.
                </p>
              </div>
              <div className="
                bg-amber-50 dark:bg-amber-900/20
                border-l-4 border-amber-500
                p-4 rounded-r-lg
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-amber-900 dark:text-amber-100
                  mb-2
                ">
                  ⚡ 즉시 실행 가능한 도구
                </h3>
                <p>
                  복잡한 설치나 설정 없이 브라우저에서 바로 사용할 수 있는 
                  실용적인 도구들을 제공하여 업무 효율성을 극대화합니다.
                </p>
              </div>
              <div className="
                bg-blue-50 dark:bg-blue-900/20
                border-l-4 border-blue-500
                p-4 rounded-r-lg
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-blue-900 dark:text-blue-100
                  mb-2
                ">
                  📚 지속적인 학습과 성장
                </h3>
                <p>
                  매일 업데이트되는 전문 인사이트 콘텐츠를 통해 최신 트렌드와 
                  실전 노하우를 습득하고, 지속적으로 성장할 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* 주요 기능 섹션 */}
          <section className="space-y-4">
            <h2 className="
              text-xl sm:text-2xl
              font-semibold
              text-gray-900 dark:text-gray-100
            ">
              주요 기능
            </h2>
            <div className="
              text-sm sm:text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
              space-y-6
            ">
              <div className="
                bg-gray-50 dark:bg-gray-700/50
                p-5 rounded-lg
                border border-gray-100 dark:border-gray-700
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-gray-900 dark:text-gray-100
                  mb-3
                ">
                  💼 전문 마케팅 분석 도구
                </h3>
                <p className="mb-3">
                  디지털 마케팅의 핵심 지표를 정확하게 분석하고 최적화할 수 있는 
                  <strong className="text-gray-900 dark:text-gray-100"> 7가지 전문 도구</strong>를 제공합니다.
                </p>
                <ul className="
                  list-disc list-inside
                  space-y-2
                  text-sm
                  text-gray-700 dark:text-gray-300
                  ml-2
                ">
                  <li><strong>광고 성과 계산</strong>: 여러 상품의 광고 성과를 비교하고 최적의 상품을 추천</li>
                  <li><strong>키워드 분석</strong>: 검색량, 경쟁도, CPC를 분석하여 최적의 키워드 발굴</li>
                  <li><strong>ROI 계산기</strong>: 투자 대비 수익률을 정확히 계산하여 광고 효과 측정</li>
                  <li><strong>손익분기점 계산기</strong>: 고정비와 변동비 기반으로 최소 판매 목표 설정</li>
                  <li><strong>광고 예산 계산기</strong>: 목표 전환수와 CPC 기반으로 필요한 예산 산출</li>
                  <li><strong>CRO 전환율 최적화</strong>: 전환율 개선에 따른 예상 매출 증가액 계산</li>
                  <li><strong>수익성 진단</strong>: 3단계 진단을 통해 CPA, LTV, LTV:CAC 비율 분석</li>
                </ul>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  ✨ 모든 도구는 Google Gemini AI를 활용한 자동 추정 및 분석 기능을 제공합니다.
                </p>
              </div>

              <div className="
                bg-gray-50 dark:bg-gray-700/50
                p-5 rounded-lg
                border border-gray-100 dark:border-gray-700
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-gray-900 dark:text-gray-100
                  mb-3
                ">
                  🛠️ 실용적인 업무 도구
                </h3>
                <p className="mb-3">
                  일상 업무에서 자주 사용하는 <strong className="text-gray-900 dark:text-gray-100">9가지 실용 도구</strong>를 
                  무료로 제공하여 업무 효율성을 높입니다.
                </p>
                <ul className="
                  list-disc list-inside
                  space-y-2
                  text-sm
                  text-gray-700 dark:text-gray-300
                  ml-2
                ">
                  <li><strong>이미지 크기 조정</strong>: 웹 최적화를 위한 이미지 리사이징</li>
                  <li><strong>파비콘 생성기</strong>: 브랜드 아이덴티티를 위한 파비콘 제작</li>
                  <li><strong>QR코드 생성기</strong>: 빠른 정보 공유를 위한 QR코드 생성</li>
                  <li><strong>URL 단축</strong>: 긴 URL을 짧고 공유하기 쉬운 링크로 변환</li>
                  <li><strong>글자수 세기</strong>: 콘텐츠 작성 시 글자수 및 단어수 확인</li>
                  <li><strong>세계시간 변환기</strong>: 글로벌 협업을 위한 시간대 변환</li>
                  <li><strong>알람시계</strong>: 업무 시간 관리 및 알림 설정</li>
                  <li><strong>파일 미리보기</strong>: PDF, Excel, Word 등 다양한 파일 형식 미리보기</li>
                  <li><strong>이자 계산기</strong>: 금융 계획을 위한 이자 계산</li>
                </ul>
              </div>

              <div className="
                bg-gray-50 dark:bg-gray-700/50
                p-5 rounded-lg
                border border-gray-100 dark:border-gray-700
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-gray-900 dark:text-gray-100
                  mb-3
                ">
                  📖 전문 인사이트 콘텐츠
                </h3>
                <p className="mb-3">
                  <strong className="text-gray-900 dark:text-gray-100">매일 자동으로 업데이트</strong>되는 
                  전문 인사이트 콘텐츠를 제공합니다. 7가지 카테고리로 분류된 
                  고품질 콘텐츠를 통해 최신 트렌드와 실전 노하우를 습득할 수 있습니다.
                </p>
                <ul className="
                  list-disc list-inside
                  space-y-2
                  text-sm
                  text-gray-700 dark:text-gray-300
                  ml-2
                ">
                  <li><strong>내일의 AI</strong>: AI 기술 트렌드와 활용 사례</li>
                  <li><strong>돈이 되는 소식</strong>: 비즈니스 및 투자 인사이트</li>
                  <li><strong>궁금한 세상 이야기</strong>: 사회 트렌드와 이슈 분석</li>
                  <li><strong>슬기로운 생활</strong>: 실용적인 생활 팁과 정보</li>
                  <li><strong>오늘보다 건강하게</strong>: 건강 및 웰빙 정보</li>
                  <li><strong>마음 채우기</strong>: 심리 및 자기계발 콘텐츠</li>
                  <li><strong>기타</strong>: 다양한 주제의 유용한 정보</li>
                </ul>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  ✨ 모든 콘텐츠는 음성 읽기 기능을 지원하여 언제 어디서나 학습할 수 있습니다.
                </p>
              </div>

              <div className="
                bg-gray-50 dark:bg-gray-700/50
                p-5 rounded-lg
                border border-gray-100 dark:border-gray-700
              ">
                <h3 className="
                  text-base sm:text-lg
                  font-semibold
                  text-gray-900 dark:text-gray-100
                  mb-3
                ">
                  🍽️ 오늘의메뉴
                </h3>
                <p className="mb-3">
                  <strong className="text-gray-900 dark:text-gray-100">매일 자동으로 업데이트</strong>되는 
                  요리 레시피를 제공합니다. 다양한 요리 방법과 재료 정보를 통해 
                  일상의 식사 준비를 더욱 쉽고 즐겁게 만들어드립니다.
                </p>
                <ul className="
                  list-disc list-inside
                  space-y-2
                  text-sm
                  text-gray-700 dark:text-gray-300
                  ml-2
                ">
                  <li><strong>다양한 요리 레시피</strong>: 일상 식사부터 특별한 날을 위한 요리까지</li>
                  <li><strong>상세한 재료 정보</strong>: 필요한 재료와 양을 명확하게 안내</li>
                  <li><strong>단계별 요리 가이드</strong>: 초보자도 따라할 수 있는 상세한 요리 방법</li>
                  <li><strong>검색 기능</strong>: 원하는 메뉴를 빠르게 찾을 수 있는 검색 기능 제공</li>
                </ul>
                {/* 레시피 데이터 업데이트 방식 안내 문구는 기획에 따라 추후 다시 추가할 수 있습니다. */}
              </div>
            </div>
          </section>

          {/* 비전 섹션 */}
          <section className="space-y-4">
            <h2 className="
              text-xl sm:text-2xl
              font-semibold
              text-gray-900 dark:text-gray-100
            ">
              우리의 비전
            </h2>
            <div className="
              text-sm sm:text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
              space-y-4
            ">
              <p>
                드라이거 (Draiger)는 단순한 도구 제공을 넘어, 
                <strong className="text-gray-900 dark:text-gray-100"> 데이터 기반 의사결정 문화</strong>를 
                확산하고자 합니다. 복잡한 분석 과정을 간소화하고, 
                전문 지식을 쉽게 접근할 수 있도록 하여 모든 사업자가 
                더 나은 비즈니스 성과를 달성할 수 있도록 돕는 것이 우리의 목표입니다.
              </p>
              <p>
                우리는 지속적인 업데이트와 개선을 통해 사용자에게 
                <strong className="text-gray-900 dark:text-gray-100"> 최고의 가치</strong>를 제공하고, 
                사용자의 피드백을 적극 반영하여 더 나은 서비스를 만들어가고 있습니다.
              </p>
            </div>
          </section>

          {/* 연락처 섹션 */}
          <section className="space-y-4">
            <h2 className="
              text-xl sm:text-2xl
              font-semibold
              text-gray-900 dark:text-gray-100
            ">
              함께 성장하기
            </h2>
            <div className="
              text-sm sm:text-base
              text-gray-600 dark:text-gray-400
              leading-relaxed
              space-y-4
            ">
              <p>
                드라이거 (Draiger)는 사용자와 함께 성장하는 플랫폼입니다. 
                궁금한 점, 개선 제안, 새로운 기능 요청 등 어떤 의견이든 환영합니다.
              </p>
              <p>
                여러분의 소중한 피드백은 더 나은 서비스를 만드는 데 큰 도움이 됩니다. 
                언제든지 편하게 문의해주세요.
              </p>
            </div>
            <Link
              href="/contact"
              className="
                inline-flex items-center
                px-6 py-3
                bg-emerald-500 hover:bg-emerald-600
                dark:bg-emerald-600 dark:hover:bg-emerald-500
                text-white
                font-semibold
                rounded-lg
                shadow-sm hover:shadow-md
                transition-all duration-300
                hover:-translate-y-0.5
                active:scale-98
              "
            >
              문의하기
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

