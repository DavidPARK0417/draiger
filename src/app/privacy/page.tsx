import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "Draiger : 데일리 툴킷 개인정보 처리방침을 확인하세요.",
  keywords: ["개인정보 처리방침", "개인정보보호", "프라이버시 정책"],
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "개인정보 처리방침 - Draiger : 데일리 툴킷",
    description: "Draiger : 데일리 툴킷 개인정보 처리방침을 확인하세요.",
    type: "website",
    url: "/privacy",
  },
  twitter: {
    card: "summary",
    title: "개인정보 처리방침 - Draiger : 데일리 툴킷",
    description: "Draiger : 데일리 툴킷 개인정보 처리방침을 확인하세요.",
  },
};

export default function PrivacyPage() {
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
            개인정보 처리방침
          </h1>
          <p className="
            text-sm sm:text-base
            text-gray-500 dark:text-gray-500
          ">
            최종 수정일: {new Date().toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="
          bg-white dark:bg-gray-800
          rounded-lg
          shadow-sm dark:shadow-gray-900/30
          border border-gray-100 dark:border-gray-700
          p-6 sm:p-8 lg:p-12
          space-y-8 sm:space-y-10
        ">
          {/* 안내 문구 */}
          <div className="
            p-4 sm:p-6
            bg-blue-50 dark:bg-blue-900/20
            border-l-4 border-blue-400 dark:border-blue-500
            rounded-lg
          ">
            <p className="
              text-sm sm:text-base
              text-gray-700 dark:text-gray-300
              leading-relaxed
            ">
              Draiger : 데일리 툴킷(이하 &quot;서비스&quot;)은 개인정보보호법에 따라 이용자의
              개인정보 보호 및 권익을 보호하고자 다음과 같은 처리방침을 두고 있습니다.
            </p>
          </div>

          {/* 개인정보 처리방침 내용 섹션 */}
          <section className="space-y-6">
            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제1조 (개인정보의 처리 목적)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
                개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
                변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는
                등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="
                mt-4
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  <strong className="text-gray-900 dark:text-gray-100">
                    1. 문의하기 서비스 제공
                  </strong>
                </p>
                <p className="ml-4">
                  문의하기 기능을 통한 고객 문의에 대한 답변 및 서비스 제공을 위해
                  개인정보를 처리합니다.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-gray-100">
                    2. 서비스 개선 및 신규 서비스 개발
                  </strong>
                </p>
                <p className="ml-4">
                  서비스 이용 통계 분석 및 서비스 개선을 위해 개인정보를 처리합니다.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-gray-100">
                    3. AI 기반 분석 서비스 제공
                  </strong>
                </p>
                <p className="ml-4">
                  Google Gemini AI를 활용한 분석 기능 제공을 위해 개인정보를 처리합니다.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-gray-100">
                    4. 오늘의메뉴 서비스 제공
                  </strong>
                </p>
                <p className="ml-4">
                  요리 레시피를 제공하기 위해 개인정보를 처리합니다.
                </p>
                <p>
                  <strong className="text-gray-900 dark:text-gray-100">
                    5. 인사이트 콘텐츠 서비스 제공
                  </strong>
                </p>
                <p className="ml-4">
                  전문 인사이트 콘텐츠를 제공하기 위해 개인정보를 처리합니다.
                </p>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제2조 (개인정보의 처리 및 보유기간)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  1. 서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                  개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
                  개인정보를 처리·보유합니다.
                </p>
                <p>
                  2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    문의하기: 문의 접수 및 처리 완료 후 3년간 보관
                  </li>
                  <li>
                    서비스 이용 기록: 서비스 제공 종료 시까지 보관
                  </li>
                  <li>
                    AI 서비스 사용: 분석 완료 후 즉시 삭제 (Google 서버에는 Google 정책에 따라 보관될 수 있음)
                  </li>
                  <li>
                    오늘의메뉴 및 인사이트 콘텐츠: Notion 데이터베이스에서 제공되는 콘텐츠로, 서비스 제공 종료 시까지 보관
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제3조 (처리하는 개인정보의 항목)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>서비스는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                <div className="ml-4 space-y-2">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">
                      문의하기 시 수집되는 정보:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>필수항목: 이름, 이메일 주소, 제목, 문의 내용</li>
                  </ul>
                  <p className="mt-4">
                    <strong className="text-gray-900 dark:text-gray-100">
                      자동 수집 정보:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>IP 주소, 쿠키, 접속 로그, 서비스 이용 기록 등</li>
                  </ul>
                  <p className="mt-4">
                    <strong className="text-gray-900 dark:text-gray-100">
                      AI 서비스 사용 시 수집되는 정보:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>상품명 또는 비즈니스 정보</li>
                    <li>계산 데이터 (판매가, 원가, 광고비, 전환수 등)</li>
                    <li>분석 요청 시점의 입력 데이터</li>
                  </ul>
                  <p className="mt-4">
                    <strong className="text-gray-900 dark:text-gray-100">
                      오늘의메뉴 및 인사이트 콘텐츠 서비스 사용 시:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>레시피 정보 (제목, 내용, 이미지 등)</li>
                    <li>인사이트 콘텐츠 (제목, 내용, 이미지 등)</li>
                    <li>콘텐츠 검색 및 조회 기록</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제4조 (개인정보의 제3자 제공)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="
                list-disc list-inside space-y-1 ml-4 mt-2
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
              ">
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">AI 서비스 제공</strong>: Google Gemini API를 통한 AI 분석 서비스 제공을 위해 Google LLC에 데이터가 전송될 수 있습니다. (사용자가 AI 기능을 사용하는 경우)
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">콘텐츠 서비스 제공</strong>: Notion API를 통한 콘텐츠 서비스 제공을 위해 Notion Labs Inc.에 데이터가 전송될 수 있습니다. (오늘의메뉴 및 인사이트 콘텐츠 조회 시)
                </li>
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Google Gemini API 데이터 전송에 대한 안내:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-600 dark:text-gray-400">
                  <li>전송되는 데이터: 상품명, 비즈니스 정보, 계산 데이터 등 (개인을 식별할 수 있는 정보는 제외)</li>
                  <li>전송 목적: AI 기반 분석 서비스 제공</li>
                  <li>보관 기간: Google 서버에는 Google의 개인정보 처리방침에 따라 보관될 수 있음</li>
                  <li>거부 권리: AI 기능 사용을 거부할 수 있으며, 이 경우 해당 기능을 사용할 수 없습니다</li>
                </ul>
              </div>
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Notion API 데이터 전송에 대한 안내:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-gray-600 dark:text-gray-400">
                  <li>전송되는 데이터: 콘텐츠 조회 요청, 검색 쿼리 등 (개인을 식별할 수 있는 정보는 제외)</li>
                  <li>전송 목적: 오늘의메뉴 및 인사이트 콘텐츠 서비스 제공</li>
                  <li>보관 기간: Notion 서버에는 Notion의 개인정보 처리방침에 따라 보관될 수 있음</li>
                  <li>거부 권리: 콘텐츠 서비스 사용을 거부할 수 있으며, 이 경우 해당 기능을 사용할 수 없습니다</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제5조 (개인정보처리의 위탁)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보
                처리업무를 위탁하고 있습니다:
              </p>
              <div className="
                mt-4
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                <p>
                  현재 개인정보 처리 위탁 업체는 없습니다. 향후 위탁이 필요한 경우,
                  본 개인정보 처리방침을 통해 공지하겠습니다.
                </p>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제6조 (정보주체의 권리·의무 및 행사방법)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련
                  권리를 행사할 수 있습니다:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>개인정보 처리정지 요구</li>
                  <li>개인정보 열람 요구</li>
                  <li>개인정보 정정·삭제 요구</li>
                  <li>개인정보 처리정지 요구</li>
                </ul>
                <p className="mt-4">
                  권리 행사는 서비스에 대해 서면, 전자우편 등을 통하여 하실 수 있으며,
                  서비스는 이에 대해 지체 없이 조치하겠습니다.
                </p>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제7조 (개인정보의 파기)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  1. 서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                  불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                </p>
                <p>
                  2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">파기절차</strong>:
                    서비스는 파기 사유가 발생한 개인정보를 선정하고, 서비스의 개인정보
                    보호책임자의 승인을 받아 개인정보를 파기합니다.
                  </li>
                  <li>
                    <strong className="text-gray-900 dark:text-gray-100">파기방법</strong>:
                    전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을
                    사용합니다.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제8조 (개인정보 보호책임자)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보
                  처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이
                  개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="
                  mt-4 p-4
                  bg-gray-50 dark:bg-gray-900/50
                  rounded-lg
                ">
                  <p>
                    <strong className="text-gray-900 dark:text-gray-100">
                      개인정보 보호책임자
                    </strong>
                  </p>
                  <p className="mt-2">
                    문의: <a
                      href="/contact"
                      className="
                        text-emerald-500 hover:text-emerald-600
                        dark:text-emerald-400 dark:hover:text-emerald-300
                        underline
                      "
                    >
                      문의하기 페이지
                    </a>를 통해 연락주시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제9조 (개인정보의 안전성 확보 조치)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
                있습니다:
              </p>
              <ul className="
                list-disc list-inside space-y-1 ml-4 mt-2
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
              ">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </div>

            <div id="ai">
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제11조 (AI 서비스 사용 및 개인정보 처리)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-3
              ">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    1. AI 서비스 제공
                  </p>
                  <p className="ml-4">
                    서비스는 Google Gemini AI를 활용하여 다음과 같은 기능을 제공합니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-8 mt-2">
                    <li>상품 정보 자동 추정</li>
                    <li>광고 성과 분석</li>
                    <li>ROI 정보 추정</li>
                    <li>수익성 진단 분석</li>
                    <li>키워드 추천</li>
                    <li>예산 계산 분석</li>
                    <li>전환율 분석</li>
                    <li>손익분기점 분석</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    2. AI 서비스 사용 시 개인정보 처리
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong className="text-gray-900 dark:text-gray-100">처리 항목</strong>: 상품명, 비즈니스 정보, 계산 데이터 등 (개인을 식별할 수 있는 정보는 제외)</li>
                    <li><strong className="text-gray-900 dark:text-gray-100">처리 목적</strong>: AI 기반 분석 서비스 제공</li>
                    <li><strong className="text-gray-900 dark:text-gray-100">제3자 제공</strong>: Google Gemini API (Google LLC)</li>
                    <li><strong className="text-gray-900 dark:text-gray-100">보관 기간</strong>: 분석 완료 후 즉시 삭제 (Google 서버에는 Google 정책에 따라 보관될 수 있음)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    3. 사용자 권리
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>AI 기능 사용 거부 권리</li>
                    <li>AI 분석 결과에 대한 설명 요구 권리</li>
                    <li>개인정보 처리 정지 요구 권리</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    4. AI 생성 콘텐츠 안내
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>AI가 생성한 분석 결과는 참고용으로만 활용하시기 바랍니다.</li>
                    <li>AI 분석 결과의 정확성을 보장하지 않으며, 실제 의사결정 시에는 추가 검증이 필요할 수 있습니다.</li>
                    <li>AI 분석 결과를 기반으로 한 의사결정에 대한 책임은 사용자에게 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제10조 (개인정보 처리방침 변경)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                이 개인정보 처리방침은 {new Date().toLocaleDateString("ko-KR")}부터
                적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는
                경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

