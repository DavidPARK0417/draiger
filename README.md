# 🚀 Draiger : 데일리 툴킷

> 디지털 마케팅 전문가와 사업자를 위한 종합 비즈니스 솔루션 플랫폼

**Draiger : 데일리 툴킷**은 복잡한 마케팅 데이터 분석부터 일상 업무에 필요한 실용적인 도구까지, 전문적인 지식과 실전 도구를 한 곳에서 제공합니다. AI 기반 자동 분석과 매일 업데이트되는 전문 인사이트를 결합하여 데이터 기반의 전략적 판단을 지원합니다.

---

## ✨ 주요 기능

### 💼 전문 마케팅 분석 도구

- **광고 성과 계산**: 여러 상품의 광고 성과를 비교하고 최적의 상품을 추천
- **키워드 분석**: 검색량, 경쟁도, CPC를 분석하여 최적의 키워드 발굴
- **ROI 계산기**: 투자 대비 수익률을 정확히 계산하여 광고 효과 측정
- **손익분기점 계산기**: 고정비와 변동비 기반으로 최소 판매 목표 설정
- **광고 예산 계산기**: 목표 전환수와 CPC 기반으로 필요한 예산 산출
- **CRO 전환율 최적화**: 전환율 개선에 따른 예상 매출 증가액 계산
- **수익성 진단**: 3단계 진단을 통해 CPA, LTV, LTV:CAC 비율 분석

> ✨ 모든 도구는 **Google Gemini AI**를 활용한 자동 추정 및 분석 기능을 제공합니다.

### 🛠️ 실용적인 업무 도구

- **이미지 크기 조정**: 웹 최적화를 위한 이미지 리사이징
- **파비콘 생성기**: 브랜드 아이덴티티를 위한 파비콘 제작
- **QR코드 생성기**: 빠른 정보 공유를 위한 QR코드 생성
- **URL 단축**: 긴 URL을 짧고 공유하기 쉬운 링크로 변환
- **글자수 세기**: 콘텐츠 작성 시 글자수 및 단어수 확인
- **세계시간 변환기**: 글로벌 협업을 위한 시간대 변환
- **알람시계**: 업무 시간 관리 및 알림 설정
- **파일 미리보기**: PDF, Excel, Word 등 다양한 파일 형식 미리보기
- **이자 계산기**: 금융 계획을 위한 이자 계산

### 📖 전문 인사이트 콘텐츠

**매일 자동으로 업데이트**되는 전문 인사이트 콘텐츠를 제공합니다.

- **내일의 AI**: AI 기술 트렌드와 활용 사례
- **돈이 되는 소식**: 비즈니스 및 투자 인사이트
- **궁금한 세상 이야기**: 사회 트렌드와 이슈 분석
- **슬기로운 생활**: 실용적인 생활 팁과 정보
- **오늘보다 건강하게**: 건강 및 웰빙 정보
- **마음 채우기**: 심리 및 자기계발 콘텐츠

### 🍽️ 오늘의메뉴

**매일 자동으로 업데이트**되는 요리 레시피를 제공합니다.

- 다양한 요리 레시피 제공
- 상세한 재료 정보 및 단계별 요리 가이드
- 검색 기능을 통한 빠른 메뉴 찾기
- Notion 데이터베이스와 자동 연동

---

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/adtoolkit.git
cd adtoolkit
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Google Gemini API (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# Notion API - 인사이트 콘텐츠용 (선택사항)
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here

# Notion API - 오늘의메뉴용 (선택사항)
NOTION_RECIPE_API_KEY=your_notion_recipe_api_key_here
NOTION_RECIPE_DATABASE_ID=your_notion_recipe_database_id_here

# 사이트 URL (SEO 및 메타데이터용)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 🔑 API 키 발급 방법

**Google Gemini API 키:**
1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. "Create API Key" 버튼 클릭
3. 생성된 API 키를 복사하여 `.env.local` 파일에 붙여넣기

**Notion API 키 (선택사항):**
1. [Notion Integrations](https://www.notion.so/my-integrations)에 접속
2. "New integration" 클릭하여 통합 생성
3. Internal Integration Token을 복사하여 환경 변수에 추가
4. 데이터베이스에 통합 연결 및 데이터베이스 ID 복사

> 💡 **참고**: Notion API 키는 인사이트 콘텐츠와 오늘의메뉴 기능을 사용할 때만 필요합니다. 마케팅 도구만 사용하는 경우 생략 가능합니다.

### 4. 개발 서버 실행

```bash
pnpm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 🛠️ 기술 스택

- **Next.js 15** - React 프레임워크 (Turbopack 사용)
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4** - 스타일링
- **Google Gemini AI** - 상품 정보 자동 추정 및 분석
- **Notion API** - 콘텐츠 관리 시스템 (CMS)
- **Recharts** - 데이터 시각화 및 차트
- **Nodemailer** - 이메일 전송 기능

---

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/              # API 라우트
│   │   ├── analyze-*     # 분석 관련 API
│   │   ├── estimate-*    # 추정 관련 API
│   │   ├── menu/         # 오늘의메뉴 API
│   │   └── contact/      # 문의하기 API
│   ├── tools/            # 도구 페이지들
│   ├── menu/             # 오늘의메뉴 페이지
│   ├── insight/          # 인사이트 콘텐츠 페이지
│   ├── contact/          # 문의하기 페이지
│   └── page.tsx          # 메인 페이지
├── components/           # 공통 컴포넌트
├── lib/                  # 유틸리티 및 라이브러리
│   ├── notion.ts         # Notion API (인사이트)
│   └── notion-recipe.ts # Notion API (오늘의메뉴)
└── utils/                # 유틸리티 함수
```

---

## 🔒 보안 고려사항

- 모든 API 키는 **서버 사이드에서만** 접근 가능합니다
- 클라이언트는 `/api/*` 엔드포인트를 통해 API를 호출합니다
- `.env.local` 파일은 Git에 커밋되지 않습니다 (`.gitignore`에 포함됨)
- 모든 API 키는 환경 변수로 관리되며 클라이언트에 노출되지 않습니다

---

## 📚 문서

프로젝트 관련 상세 문서는 `docs` 폴더에서 확인할 수 있습니다:

- [사이트 소개](./docs/사이트소개.md) - 프로젝트 전체 소개 및 기능 설명
- [향후 구현 계획](./docs/향후-구현-계획.md) - 프로젝트 개선 사항 및 구현 계획
- [기술 스택 가이드](./docs/기술-스택-가이드.md) - 사용할 라이브러리 및 도구 가이드
- [프로젝트 기술 문서](./docs/프로젝트-기술-문서.md) - 상세 기술 문서

---

## 🎯 개발 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
pnpm run dev

# 프로덕션 빌드 (Turbopack 사용)
pnpm run build

# 프로덕션 서버 실행
pnpm run start

# 코드 린팅
pnpm run lint
```

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request를 환영합니다! 이슈를 열어주시거나 Pull Request를 보내주세요.

---

## 📧 문의하기

프로젝트에 대한 문의사항이 있으시면 언제든지 연락해주세요.

- 이메일: [문의하기 페이지](/contact)를 통해 문의 가능
- 사이트: [Draiger : 데일리 툴킷](https://adtoolkit.kr)

---

**Made with ❤️ by Draiger Team**
