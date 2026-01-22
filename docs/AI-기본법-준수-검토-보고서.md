# AI 기본법 준수 검토 보고서

> 작성일: 2026년 1월 22일  
> 법률명: 인공지능 발전과 신뢰 기반 조성 등에 관한 기본법  
> 공포일: 2025년 1월 21일 (법률 제20676호)  
> 시행일: 2026년 1월 22일

## 📋 목차

1. [법령 개요](#법령-개요)
2. [프로젝트 AI 사용 현황](#프로젝트-ai-사용-현황)
3. [주요 의무사항 체크리스트](#주요-의무사항-체크리스트)
4. [위배 가능성 분석](#위배-가능성-분석)
5. [개선 방안](#개선-방안)
6. [즉시 조치 사항](#즉시-조치-사항)

---

## 법령 개요

### 기본 정보

- **법률명**: 인공지능 발전과 신뢰 기반 조성 등에 관한 기본법
- **공포일**: 2025년 1월 21일
- **시행일**: 2026년 1월 22일
- **법률번호**: 법률 제20676호

### 법령의 목적

AI 기술의 발전과 신뢰 기반 조성을 위한 기본 원칙과 제도를 마련하여, AI 기술의 건전한 발전과 국민의 권익 보호를 도모하는 것을 목적으로 합니다.

---

## 프로젝트 AI 사용 현황

### 사용 중인 AI 서비스

프로젝트는 **Google Gemini API**를 사용하여 다음과 같은 AI 기능을 제공하고 있습니다:

#### 1. 상품 정보 자동 추정 (`/api/estimate-product`)
- **기능**: 상품명만 입력하면 AI가 판매가, 순이익, 광고비, 전환수를 자동으로 추정
- **사용 위치**: 광고 성과 계산 도구 (`/tools/ad-performance`)
- **데이터 처리**: 사용자 입력(상품명) → Google Gemini API 전송 → AI 분석 결과 반환

#### 2. 광고 성과 분석 (`/api/analyze-performance`)
- **기능**: 여러 상품의 광고 성과 데이터를 종합적으로 분석하고 인사이트 제공
- **사용 위치**: 광고 성과 계산 도구 (`/tools/ad-performance`)
- **데이터 처리**: 계산된 상품 데이터 → Google Gemini API 전송 → 마크다운 형식 분석 결과 반환

#### 3. ROI 정보 추정 (`/api/estimate-roi`)
- **기능**: 상품/비즈니스에 대한 ROI 계산에 필요한 정보 추정
- **사용 위치**: ROI 계산기 (`/tools/roi-calculator`)
- **데이터 처리**: 상품명 또는 비즈니스 정보 → Google Gemini API 전송 → ROI 관련 정보 반환

#### 4. 수익성 진단 분석 (`/api/analyze-profitability`)
- **기능**: 마케팅 수익성 진단 결과를 종합적으로 분석하고 인사이트 제공
- **사용 위치**: 수익성 진단 도구 (`/tools/profitability-diagnosis`)
- **데이터 처리**: 계산된 수익성 데이터 → Google Gemini API 전송 → 마크다운 형식 분석 결과 반환

#### 5. 키워드 추천 (`/api/estimate-keyword`)
- **기능**: 키워드 분석에 필요한 정보 추정
- **사용 위치**: 키워드 분석 도구 (`/tools/keyword-analysis`)
- **데이터 처리**: 사용자 입력 → Google Gemini API 전송 → 키워드 정보 반환

#### 6. 기타 AI 분석 기능
- 예산 계산기 분석 (`/api/analyze-budget`)
- 전환율 계산기 분석 (`/api/analyze-cro`)
- 손익분기점 분석 (`/api/analyze-break-even`)

### 데이터 흐름

```
사용자 입력
    ↓
프론트엔드 (React)
    ↓
API 라우트 (Next.js)
    ↓
Google Gemini API (외부 서비스)
    ↓
AI 분석 결과
    ↓
사용자에게 표시
```

### 개인정보 처리 현황

- **수집 정보**: 상품명, 비즈니스 정보, 계산 데이터 등
- **제3자 제공**: Google Gemini API로 데이터 전송
- **보관 기간**: 현재 명시적 정책 없음
- **개인정보 처리방침**: AI 사용에 대한 명시적 언급 없음

---

## 주요 의무사항 체크리스트

### ✅ 1. AI 서비스 제공 사실 고지 의무

**법령 요구사항**: AI 서비스를 제공하는 경우, 사용자에게 AI 사용 사실을 명확히 고지해야 합니다.

**현재 상태**: ❌ **미준수**
- AI 기능 사용 시 명시적인 고지가 없음
- 사용자가 AI를 사용하고 있다는 사실을 인지하기 어려움
- AI 분석 결과 표시 시 "AI 생성" 표시 없음

**위치**: 모든 AI 기능 사용 페이지

---

### ✅ 2. AI 생성 콘텐츠 표시 의무

**법령 요구사항**: AI가 생성한 콘텐츠임을 명확히 표시해야 합니다.

**현재 상태**: ❌ **미준수**
- AI 분석 결과를 표시할 때 "AI 생성" 또는 "AI 기반 분석" 표시 없음
- 사용자가 AI가 생성한 콘텐츠인지 구분하기 어려움

**위치**: 
- `/tools/ad-performance/page.tsx` (AI 분석 결과 표시)
- `/tools/profitability-diagnosis/page.tsx` (AI 분석 결과 표시)
- `/tools/roi-calculator/page.tsx` (AI 분석 결과 표시)
- 기타 AI 분석 결과를 표시하는 모든 페이지

---

### ✅ 3. 개인정보 처리 고지 의무

**법령 요구사항**: AI 서비스 제공 시 개인정보 처리에 대한 고지가 필요합니다.

**현재 상태**: ⚠️ **부분 준수**
- 개인정보 처리방침은 존재하나 AI 사용에 대한 명시적 언급 없음
- Google Gemini API로 데이터 전송에 대한 고지 없음
- 제3자 제공(Google)에 대한 명시 없음

**위치**: 
- `/docs/개인정보-처리방침.md`
- `/src/app/privacy/page.tsx`

---

### ✅ 4. 데이터 보호 및 안전성 확보

**법령 요구사항**: AI 서비스 제공 시 데이터 보호 및 안전성 확보 조치가 필요합니다.

**현재 상태**: ✅ **기본 준수**
- API 키는 환경 변수로 관리 (`GEMINI_API_KEY`)
- 서버 사이드에서만 API 호출 (클라이언트 노출 없음)
- 에러 처리 및 검증 로직 존재

**위치**: 모든 API 라우트 (`/src/app/api/**/route.ts`)

---

### ✅ 5. 사용자 동의 및 선택권 보장

**법령 요구사항**: 사용자가 AI 기능 사용에 대한 동의를 할 수 있어야 합니다.

**현재 상태**: ❌ **미준수**
- AI 기능 사용 전 동의 절차 없음
- 사용자가 AI 기능을 선택적으로 사용할 수 있는 옵션 없음
- AI 기능 사용 거부 시 대안 제공 없음

**위치**: 모든 AI 기능 사용 페이지

---

### ✅ 6. 편향성 및 차별 금지

**법령 요구사항**: AI 서비스가 편향적이거나 차별적인 결과를 생성하지 않도록 해야 합니다.

**현재 상태**: ⚠️ **검토 필요**
- 현재는 마케팅 데이터 분석에 한정되어 있어 직접적 차별 가능성 낮음
- 다만 AI 모델(Google Gemini)의 편향성에 대한 모니터링 필요

---

### ✅ 7. 설명가능성 및 투명성

**법령 요구사항**: AI 서비스의 작동 방식과 결과에 대한 설명을 제공해야 합니다.

**현재 상태**: ❌ **미준수**
- AI 분석 결과의 근거나 작동 방식에 대한 설명 없음
- 사용자가 AI가 어떻게 분석했는지 이해하기 어려움

---

## 위배 가능성 분석

### 🔴 높은 위배 가능성

#### 1. AI 서비스 제공 사실 미고지
- **위배 조문**: AI 기본법 제XX조 (AI 서비스 제공자 고지 의무)
- **현재 상태**: AI 기능 사용 시 명시적 고지 없음
- **위험도**: 높음
- **조치 필요**: 즉시 개선 필요

#### 2. AI 생성 콘텐츠 미표시
- **위배 조문**: AI 기본법 제XX조 (AI 생성 콘텐츠 표시 의무)
- **현재 상태**: AI 분석 결과에 "AI 생성" 표시 없음
- **위험도**: 높음
- **조치 필요**: 즉시 개선 필요

#### 3. 개인정보 처리 미고지
- **위배 조문**: 개인정보보호법 + AI 기본법
- **현재 상태**: Google Gemini API로 데이터 전송에 대한 고지 없음
- **위험도**: 높음
- **조치 필요**: 즉시 개선 필요

### 🟡 중간 위배 가능성

#### 4. 사용자 동의 절차 부재
- **위배 조문**: AI 기본법 제XX조 (사용자 동의)
- **현재 상태**: AI 기능 사용 전 동의 절차 없음
- **위험도**: 중간
- **조치 필요**: 개선 권장

#### 5. 설명가능성 부족
- **위배 조문**: AI 기본법 제XX조 (설명가능성)
- **현재 상태**: AI 분석 근거 설명 없음
- **위험도**: 중간
- **조치 필요**: 개선 권장

### 🟢 낮은 위배 가능성

#### 6. 데이터 보호 및 안전성
- **현재 상태**: 기본적인 보안 조치 존재
- **위험도**: 낮음
- **조치 필요**: 지속적 모니터링

---

## 개선 방안

### 1. AI 서비스 제공 사실 고지 추가

#### 구현 방법

**A. 각 AI 기능 사용 페이지에 고지 배너 추가**

```tsx
// 예시: /src/components/AIServiceNotice.tsx
export function AIServiceNotice() {
  return (
    <div className="
      mb-6 p-4
      bg-blue-50 dark:bg-blue-900/20
      border border-blue-200 dark:border-blue-800
      rounded-lg
    ">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            AI 기반 서비스 안내
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            본 기능은 Google Gemini AI를 활용하여 제공됩니다. 
            입력하신 정보는 AI 분석을 위해 Google 서버로 전송될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
```

**B. AI 기능 사용 전 동의 체크박스 추가**

```tsx
// 예시: AI 기능 사용 전 동의
const [aiConsent, setAiConsent] = useState(false);

<div className="mb-4">
  <label className="flex items-start gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={aiConsent}
      onChange={(e) => setAiConsent(e.target.checked)}
      className="mt-1"
    />
    <span className="text-sm text-gray-700 dark:text-gray-300">
      AI 기반 분석 기능 사용에 동의합니다. 
      <Link href="/privacy#ai" className="text-emerald-600 dark:text-emerald-400 underline">
        자세히 보기
      </Link>
    </span>
  </label>
</div>
```

#### 적용 위치

- `/tools/ad-performance/page.tsx`
- `/tools/profitability-diagnosis/page.tsx`
- `/tools/roi-calculator/page.tsx`
- `/tools/keyword-analysis/page.tsx`
- 기타 모든 AI 기능 사용 페이지

---

### 2. AI 생성 콘텐츠 표시 추가

#### 구현 방법

**A. AI 분석 결과 상단에 표시 배지 추가**

```tsx
// AI 분석 결과 표시 시
{aiAnalysis && (
  <div className="mb-6">
    {/* AI 생성 콘텐츠 표시 */}
    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <span className="font-medium">AI 기반 분석 결과</span>
      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
        AI 생성 콘텐츠
      </span>
    </div>
    
    {/* AI 분석 결과 본문 */}
    <div className="prose prose-sm max-w-none dark:prose-invert">
      {renderMarkdown(aiAnalysis)}
    </div>
  </div>
)}
```

**B. AI 분석 결과 하단에 주의사항 추가**

```tsx
<div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
  <p className="text-xs text-amber-800 dark:text-amber-200">
    ⚠️ 본 분석 결과는 AI가 생성한 것으로, 참고용으로만 활용하시기 바랍니다. 
    실제 의사결정 시에는 추가 검증이 필요할 수 있습니다.
  </p>
</div>
```

#### 적용 위치

모든 AI 분석 결과를 표시하는 컴포넌트

---

### 3. 개인정보 처리방침 업데이트

#### 추가할 내용

**A. AI 서비스 사용에 대한 명시적 언급**

```markdown
## 제11조 (AI 서비스 사용 및 개인정보 처리)

### 1. AI 서비스 제공
서비스는 Google Gemini AI를 활용하여 다음과 같은 기능을 제공합니다:
- 상품 정보 자동 추정
- 광고 성과 분석
- ROI 정보 추정
- 수익성 진단 분석
- 키워드 추천

### 2. AI 서비스 사용 시 개인정보 처리
- **처리 항목**: 상품명, 비즈니스 정보, 계산 데이터 등
- **처리 목적**: AI 기반 분석 서비스 제공
- **제3자 제공**: Google Gemini API (Google LLC)
- **보관 기간**: 분석 완료 후 즉시 삭제 (Google 서버에는 Google 정책에 따라 보관될 수 있음)

### 3. 사용자 권리
- AI 기능 사용 거부 권리
- AI 분석 결과에 대한 설명 요구 권리
- 개인정보 처리 정지 요구 권리
```

**B. 제3자 제공 항목에 Google 추가**

```markdown
## 제4조 (개인정보의 제3자 제공)

서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
다만, 다음의 경우에는 예외로 합니다:

- **AI 서비스 제공**: Google Gemini API를 통한 AI 분석 서비스 제공을 위해 
  Google LLC에 데이터가 전송될 수 있습니다. (사용자 동의 시)
- 이용자가 사전에 동의한 경우
- 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 
  수사기관의 요구가 있는 경우
```

#### 적용 위치

- `/docs/개인정보-처리방침.md`
- `/src/app/privacy/page.tsx`

---

### 4. 이용약관 업데이트

#### 추가할 내용

```markdown
## 제X조 (AI 서비스 이용)

### 1. AI 서비스 제공
본 서비스는 Google Gemini AI를 활용한 분석 기능을 제공합니다.

### 2. AI 생성 콘텐츠의 성격
- AI가 생성한 분석 결과는 참고용으로만 활용하시기 바랍니다.
- AI 분석 결과의 정확성을 보장하지 않으며, 실제 의사결정 시에는 추가 검증이 필요할 수 있습니다.

### 3. 사용자 책임
- AI 분석 결과를 기반으로 한 의사결정에 대한 책임은 사용자에게 있습니다.
- AI 분석 결과로 인한 손해에 대해 서비스는 책임을 지지 않습니다.
```

---

### 5. AI 기능 사용 전 동의 절차 추가

#### 구현 방법

```tsx
// 예시: AI 기능 사용 전 동의 모달
function AIConsentModal({ isOpen, onAccept, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          AI 기반 분석 기능 사용 동의
        </h3>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            본 기능은 Google Gemini AI를 활용하여 제공됩니다.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>입력하신 정보는 AI 분석을 위해 Google 서버로 전송됩니다.</li>
            <li>AI 분석 결과는 참고용으로만 활용하시기 바랍니다.</li>
            <li>AI 분석 결과의 정확성을 보장하지 않습니다.</li>
          </ul>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            거부
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
          >
            동의하고 사용하기
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 즉시 조치 사항

### 🔴 긴급 (시행일 전 완료 필요)

1. **AI 서비스 제공 사실 고지 추가**
   - 각 AI 기능 사용 페이지에 고지 배너 추가
   - 예상 소요 시간: 2-3시간

2. **AI 생성 콘텐츠 표시 추가**
   - 모든 AI 분석 결과에 "AI 생성" 표시 추가
   - 예상 소요 시간: 1-2시간

3. **개인정보 처리방침 업데이트**
   - AI 서비스 사용 및 Google Gemini API 데이터 전송 명시
   - 예상 소요 시간: 1시간

### 🟡 중요 (시행일 전 완료 권장)

4. **이용약관 업데이트**
   - AI 서비스 이용 조항 추가
   - 예상 소요 시간: 30분

5. **AI 기능 사용 전 동의 절차 추가**
   - 동의 모달 또는 체크박스 추가
   - 예상 소요 시간: 2-3시간

### 🟢 개선 (지속적 개선)

6. **설명가능성 개선**
   - AI 분석 근거 설명 추가
   - 예상 소요 시간: 4-6시간

---

## 체크리스트

### 시행일(2026년 1월 22일) 전 완료 사항

- [ ] 모든 AI 기능 사용 페이지에 AI 서비스 제공 사실 고지 배너 추가
- [ ] 모든 AI 분석 결과에 "AI 생성 콘텐츠" 표시 추가
- [ ] 개인정보 처리방침에 AI 서비스 사용 및 Google Gemini API 데이터 전송 명시
- [ ] 이용약관에 AI 서비스 이용 조항 추가
- [ ] AI 기능 사용 전 동의 절차 추가 (선택사항이지만 권장)
- [ ] AI 분석 결과 하단에 주의사항 추가
- [ ] 법률 전문가 검토 (권장)

---

## 참고 자료

- [인공지능 발전과 신뢰 기반 조성 등에 관한 기본법](https://www.law.go.kr/lsInfoP.do?lsiSeq=268543)
- [개인정보보호법](https://www.law.go.kr/lsSc.do?section=&menuId=1&subMenuId=7&tabMenuId=3&query=%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8%EB%B2%95)
- [Google Gemini API 개인정보 처리](https://ai.google.dev/terms)

---

## 결론

현재 프로젝트는 AI 기본법의 주요 의무사항 중 **AI 서비스 제공 사실 고지**, **AI 생성 콘텐츠 표시**, **개인정보 처리 고지** 부분에서 **위배 가능성이 높습니다**.

**시행일(2026년 1월 22일) 전에** 위 개선 사항들을 반드시 적용하여 법률 위배를 방지해야 합니다.

특히 다음 3가지는 **반드시** 시행일 전에 완료해야 합니다:

1. ✅ AI 서비스 제공 사실 고지 추가
2. ✅ AI 생성 콘텐츠 표시 추가  
3. ✅ 개인정보 처리방침 업데이트

---

**작성자**: AI Assistant  
**검토 필요**: 법률 전문가 검토 권장  
**최종 업데이트**: 2026년 1월 22일

