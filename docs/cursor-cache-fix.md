# Cursor 내부 창 캐시 문제 해결 가이드

## 문제 상황
Cursor AI 내부 창에서만 "블로그"가 "인사이트"로 변경되지 않고 이전 내용이 표시되는 경우

## 해결 방법

### 방법 1: Service Worker 캐시 버전 업데이트 (자동)
코드에서 Service Worker 캐시 버전이 `v4`로 업데이트되었습니다. 
개발 서버를 재시작하면 자동으로 기존 캐시가 무효화됩니다.

### 방법 2: Cursor 내부 창에서 수동으로 캐시 삭제

1. **Cursor 내부 창에서 개발자 도구 열기**
   - `F12` 또는 `Ctrl + Shift + I` (Windows)
   - `Cmd + Option + I` (Mac)

2. **Application 탭으로 이동**
   - 개발자 도구 상단의 "Application" 탭 클릭

3. **Service Workers 섹션 확인**
   - 왼쪽 사이드바에서 "Service Workers" 클릭
   - 등록된 Service Worker가 있다면 "Unregister" 버튼 클릭

4. **Cache Storage 삭제**
   - 왼쪽 사이드바에서 "Cache Storage" 클릭
   - 모든 캐시 항목을 선택하고 우클릭 → "Delete" 선택
   - 또는 각 캐시를 개별적으로 삭제

5. **Storage 전체 삭제 (필요시)**
   - 왼쪽 사이드바에서 "Storage" 클릭
   - "Clear site data" 버튼 클릭
   - 또는 "Clear storage" 버튼 클릭

6. **페이지 새로고침**
   - `Ctrl + Shift + R` (Windows) 또는 `Cmd + Shift + R` (Mac)
   - 또는 개발자 도구가 열린 상태에서 새로고침 버튼을 길게 눌러 "Empty Cache and Hard Reload" 선택

### 방법 3: 개발 서버 재시작

```bash
# 현재 실행 중인 서버 중지 (Ctrl + C)
# .next 폴더 삭제 (선택사항)
Remove-Item -Recurse -Force .next

# 서버 재시작
pnpm run dev
```

### 방법 4: Cursor 내부 창 완전히 닫기

1. Cursor 내부 미리보기 창을 완전히 닫기
2. Cursor를 재시작
3. 개발 서버를 재시작한 후 다시 열기

## 개발 환경에서 Service Worker 자동 해제

코드가 업데이트되어 개발 환경(`NODE_ENV === 'development'`)에서는:
- 기존 Service Worker가 자동으로 해제됩니다
- 모든 캐시가 자동으로 삭제됩니다
- Service Worker가 등록되지 않습니다

이제 개발 서버를 재시작하면 자동으로 처리됩니다.

## 확인 방법

1. Cursor 내부 창에서 개발자 도구 열기 (`F12`)
2. Console 탭에서 다음 메시지 확인:
   - `[PWA] 개발 환경: Service Worker 해제 완료`
   - `[PWA] 개발 환경: 모든 캐시 삭제 완료`
3. Application 탭에서 Service Workers가 비어있는지 확인
4. 페이지를 새로고침하고 "인사이트"로 표시되는지 확인

## 추가 문제 해결

위 방법으로 해결되지 않는 경우:

1. **Cursor 설정 확인**
   - Cursor 설정에서 캐시 관련 옵션 확인
   - Cursor를 최신 버전으로 업데이트

2. **포트 변경**
   - 다른 포트에서 개발 서버 실행
   - `package.json`의 dev 스크립트에 포트 지정: `next dev -p 3001`

3. **브라우저 캐시 완전 삭제**
   - Cursor 내부 창에서 `Ctrl + Shift + Delete` (Windows)
   - 캐시된 이미지 및 파일 삭제 선택


