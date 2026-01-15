import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Draiger : 데일리 툴킷 이용약관을 확인하세요.",
  keywords: ["이용약관", "서비스 약관", "이용 규정"],
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "이용약관 - Draiger : 데일리 툴킷",
    description: "Draiger : 데일리 툴킷 이용약관을 확인하세요.",
    type: "website",
    url: "/terms",
  },
  twitter: {
    card: "summary",
    title: "이용약관 - Draiger : 데일리 툴킷",
    description: "Draiger : 데일리 툴킷 이용약관을 확인하세요.",
  },
};

export default function TermsPage() {
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
            이용약관
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
            bg-amber-50 dark:bg-amber-900/20
            border-l-4 border-amber-400 dark:border-amber-500
            rounded-lg
          ">
            <p className="
              text-sm sm:text-base
              text-gray-700 dark:text-gray-300
              leading-relaxed
            ">
              본 이용약관은 Draiger : 데일리 툴킷 서비스 이용에 관한 규정입니다.
              서비스를 이용하시기 전에 반드시 읽어보시기 바랍니다.
            </p>
          </div>

          {/* 약관 내용 섹션 */}
          <section className="space-y-6">
            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제1조 (목적)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                본 약관은 Draiger : 데일리 툴킷(이하 &quot;서비스&quot;)이 제공하는 온라인
                서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및
                책임사항을 규정함을 목적으로 합니다.
              </p>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제2조 (정의)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    &quot;서비스&quot;란 Draiger : 데일리 툴킷이 제공하는 모든 온라인
                    서비스를 의미합니다.
                  </li>
                  <li>
                    &quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 모든 사용자를
                    의미합니다.
                  </li>
                  <li>
                    &quot;콘텐츠&quot;란 서비스를 통해 제공되는 모든 정보, 데이터, 텍스트,
                    이미지 등을 의미합니다.
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
                제3조 (약관의 효력 및 변경)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                  공지함으로써 효력이 발생합니다.
                </p>
                <p>
                  2. 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본
                  약관을 변경할 수 있습니다.
                </p>
                <p>
                  3. 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 명시하여
                  현행약관과 함께 서비스의 초기화면에 그 시행일 7일 이전부터
                  시행일 후 상당한 기간 동안 공지합니다.
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
                제4조 (서비스의 제공 및 변경)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  1. 서비스는 다음과 같은 업무를 수행합니다:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>마케팅 도구 제공</li>
                  <li>유용한 도구 제공</li>
                  <li>인사이트 콘텐츠 제공</li>
                  <li>기타 서비스가 정하는 업무</li>
                </ul>
                <p>
                  2. 서비스는 필요한 경우 서비스의 내용을 추가 또는 변경할 수
                  있습니다.
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
                제5조 (서비스의 중단)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의
                두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할
                수 있습니다.
              </p>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제6조 (이용자의 의무)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>서비스에 게시된 정보의 변경</li>
                  <li>서비스가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                  <li>서비스 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
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
                제7조 (저작권의 귀속 및 이용제한)
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에
                귀속합니다. 이용자는 서비스를 이용함으로써 얻은 정보를 서비스의
                사전 승낙 없이 복제, 송신, 출판, 배포, 방기 기타 방법에 의하여
                영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </div>

            <div>
              <h2 className="
                text-lg sm:text-xl
                font-semibold
                text-gray-900 dark:text-gray-100
                mb-3
              ">
                제8조 (면책조항)
              </h2>
              <div className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
                space-y-2
              ">
                <p>
                  1. 서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를
                  제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                </p>
                <p>
                  2. 서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는
                  책임을 지지 않습니다.
                </p>
                <p>
                  3. 서비스는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에
                  대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한
                  손해에 관하여 책임을 지지 않습니다.
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
                부칙
              </h2>
              <p className="
                text-sm sm:text-base
                text-gray-600 dark:text-gray-400
                leading-relaxed
              ">
                본 약관은 {new Date().toLocaleDateString("ko-KR")}부터 시행됩니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

