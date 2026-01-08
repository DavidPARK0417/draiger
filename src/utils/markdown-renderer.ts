// 마크다운을 HTML로 변환하는 공통 함수
// 마크다운 기호를 제거하고 중요한 부분을 색상으로 강조

export function renderMarkdown(text: string): string {
  // 마크다운 기호 제거 및 텍스트 정리
  const cleanedText = text
    // 마크다운 헤더 기호 제거 (#, ##, ###)
    .replace(/^#{1,6}\s+/gm, '')
    // 볼드 마크다운 제거 (**텍스트** -> 텍스트)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // 이탤릭 마크다운 제거 (*텍스트* -> 텍스트)
    .replace(/\*(.*?)\*/g, '$1')
    // 리스트 마크다운 기호 제거 (-, *, 숫자.)
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');
  
  // 줄 단위로 분리
  const lines = cleanedText.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];
  
  // 중요한 키워드를 색상으로 강조하는 함수
  const highlightImportant = (text: string): string => {
    // HTML 태그 내부는 건너뛰기 위해 텍스트를 분리
    const htmlTagRegex = /<[^>]+>/g;
    const parts: Array<{ text: string; isHtml: boolean }> = [];
    let lastIndex = 0;
    let match;
    
    // HTML 태그로 텍스트 분리
    while ((match = htmlTagRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), isHtml: false });
      }
      parts.push({ text: match[0], isHtml: true });
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), isHtml: false });
    }
    
    if (parts.length === 0) {
      parts.push({ text: text, isHtml: false });
    }
    
    // 한글 단어 경계를 위한 헬퍼 함수
    const createWordBoundaryRegex = (keyword: string): RegExp => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 영문의 경우: 단어 경계 사용
      if (/^[A-Z]+$/.test(keyword)) {
        return new RegExp(`\\b${escaped}\\b`, 'gi');
      } else {
        // 한글: 앞뒤가 한글이 아닌 경우만 매칭
        // 앞: 한글이 아니거나 문장 시작
        // 뒤: 한글이 아니거나 문장 끝
        return new RegExp(`(?<![가-힣])${escaped}(?![가-힣])`, 'g');
      }
    };
    
    // 각 텍스트 부분에 색상 강조 적용
    const processedParts = parts.map(part => {
      if (part.isHtml) {
        return part.text; // HTML 태그는 그대로
      }
      
      let processed = part.text;
      
      // 숫자와 금액 강조 (빨간색) - 정확한 패턴만, 단어 경계 사용
      // "점"은 숫자 뒤에만 매칭되도록 수정 (예: "100점"은 매칭, "문제점"의 "점"은 매칭 안됨)
      processed = processed.replace(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(원|%|배|개|건|회|월|년|일|시간|분|초|배율|배수|:1|회차)(?![가-힣])/g, 
        '<span class="font-bold text-red-600 dark:text-red-400">$1$2</span>');
      // "점"은 숫자 바로 뒤에만 매칭 (공백 없이)
      processed = processed.replace(/(\d{1,3}(?:,\d{3})*(?:\.\d+)?)점(?![가-힣])/g, 
        '<span class="font-bold text-red-600 dark:text-red-400">$1점</span>');
      
      // 중요한 키워드 목록 (파란색) - 긴 단어부터 처리하여 부분 매칭 방지
      const importantKeywords = [
        '손익분기점', // 긴 단어 먼저
        'ROI', 'ROAS', '순이익', '매출', '광고비', '전환율', '클릭수', 
        'CPC', 'CPA', 'LTV', 'CAC', '목표', '최적화', '전략', '효과', 
        '성과', '분석', '권장', '제안', '키워드', '검색량', '경쟁도', 
        '점수', '고정비', '변동비', '기여이익'
      ];
      
      // 긍정적 표현 (녹색)
      const positiveKeywords = [
        '증가', '향상', '성공', '효과적', '최적', '우수', '높음', 
        '좋음', '건강함', '완료', '달성', '높은', '우수한', '효율적'
      ];
      
      // 경고 표현 (주황색) - 구체적인 표현 먼저
      const warningPhrases = ['개선 필요', '부족한'];
      const warningKeywords = ['경고', '낮음', '부족', '위험', '부정적', '낮은', '미흡', '주의', '문제'];
      
      // 이미 색상이 적용된 부분을 건너뛰는 함수
      const replaceIfNotHighlighted = (text: string, regex: RegExp, replacement: string): string => {
        return text.replace(regex, (match, offset, string) => {
          // 매칭된 부분 앞의 텍스트 확인
          const beforeMatch = string.substring(Math.max(0, offset - 100), offset);
          
          // 이미 <span 태그가 열려있고 닫히지 않은 경우 건너뛰기
          const openSpanTags = (beforeMatch.match(/<span[^>]*>/g) || []).length;
          const closeSpanTags = (beforeMatch.match(/<\/span>/g) || []).length;
          
          if (openSpanTags > closeSpanTags) {
            return match; // 이미 색상이 적용된 부분
          }
          
          return replacement.replace('$1', match);
        });
      };
      
      // 1. 긍정적 표현 처리 (녹색) - 먼저 처리
      positiveKeywords.forEach(keyword => {
        const regex = createWordBoundaryRegex(keyword);
        processed = replaceIfNotHighlighted(processed, regex, '<span class="font-semibold text-emerald-600 dark:text-emerald-400">$1</span>');
      });
      
      // 2. 경고 구문 처리 (주황색) - 구체적인 표현 먼저
      warningPhrases.forEach(phrase => {
        const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        processed = replaceIfNotHighlighted(processed, regex, '<span class="font-semibold text-orange-600 dark:text-orange-400">$1</span>');
      });
      
      // 3. 경고 키워드 처리 (주황색)
      warningKeywords.forEach(keyword => {
        const regex = createWordBoundaryRegex(keyword);
        processed = replaceIfNotHighlighted(processed, regex, '<span class="font-semibold text-orange-600 dark:text-orange-400">$1</span>');
      });
      
      // 4. 중요한 키워드 처리 (파란색) - 마지막에 처리, 긴 단어부터 처리
      // 긴 단어부터 처리하여 "점수"가 "점"보다 먼저 매칭되도록 함
      importantKeywords.sort((a, b) => b.length - a.length);
      importantKeywords.forEach(keyword => {
        const regex = createWordBoundaryRegex(keyword);
        processed = replaceIfNotHighlighted(processed, regex, '<span class="font-semibold text-blue-600 dark:text-blue-400">$1</span>');
      });
      
      return processed;
    });
    
    return processedParts.join('');
  };
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // 빈 줄 처리
    if (!line) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push('<br />');
      continue;
    }
    
    // 표 처리 (마크다운 표 형식: | 컬럼1 | 컬럼2 |)
    if (line.includes('|') && line.split('|').length >= 3) {
      // 헤더 구분선 체크 (|---|---|)
      if (/^[\|\s\-:]+$/.test(line)) {
        continue; // 헤더 구분선은 건너뛰기
      }
      
      if (!inTable) {
        // 표 시작
        inTable = true;
        tableRows = [];
      }
      
      // 표 행 파싱 (마크다운 기호 제거)
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell)
        .map(cell => cell.replace(/\*\*/g, '').replace(/\*/g, ''));
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      // 표 종료
      if (tableRows.length > 0) {
        processedLines.push('<div class="overflow-x-auto my-4">');
        processedLines.push('<table class="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">');
        
        // 첫 번째 행을 헤더로 사용
        if (tableRows.length > 0) {
          processedLines.push('<thead>');
          processedLines.push('<tr class="bg-gray-100 dark:bg-gray-700">');
          tableRows[0].forEach(cell => {
            processedLines.push(`<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200">${highlightImportant(cell)}</th>`);
          });
          processedLines.push('</tr>');
          processedLines.push('</thead>');
          processedLines.push('<tbody>');
          
          // 나머지 행들을 데이터로 사용
          for (let j = 1; j < tableRows.length; j++) {
            processedLines.push('<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">');
            tableRows[j].forEach(cell => {
              processedLines.push(`<td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${highlightImportant(cell)}</td>`);
            });
            processedLines.push('</tr>');
          }
          processedLines.push('</tbody>');
        }
        
        processedLines.push('</table>');
        processedLines.push('</div>');
      }
      inTable = false;
      tableRows = [];
    }
    
    // 헤더 처리 (숫자로 시작하는 제목 감지, 마크다운 기호 제거)
    if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      const titleText = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').replace(/\*/g, '');
      // 제목은 전체를 파란색으로 표시 (개별 키워드 강조 없이)
      processedLines.push(`<h2 class="text-2xl font-bold mt-6 mb-4 text-blue-700 dark:text-blue-300">${titleText}</h2>`);
      continue;
    }
    
    // 리스트 처리 (마크다운 기호 제거된 상태)
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      if (!inList) {
        processedLines.push('<ul class="list-disc ml-6 mb-3 space-y-1">');
        inList = true;
      }
      const content = line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').replace(/\*/g, '');
      processedLines.push(`<li class="text-gray-700 dark:text-gray-300">${highlightImportant(content)}</li>`);
      continue;
    }
    
    // 일반 텍스트
    if (inList) {
      processedLines.push('</ul>');
      inList = false;
    }
    
    // 마크다운 기호 제거
    line = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/^#+\s+/, '');
    
    // 제목처럼 보이는 텍스트는 큰 제목으로 처리 (전체를 파란색으로)
    // 제목 패턴: ":" 또는 "："로 끝나고, 길이가 100자 이하인 경우
    if (line.length < 100 && (line.endsWith(':') || line.endsWith('：'))) {
      // 제목은 전체를 파란색으로 표시 (개별 키워드 강조 없이)
      processedLines.push(`<h3 class="text-lg font-semibold mt-4 mb-2 text-blue-600 dark:text-blue-400">${line}</h3>`);
    } else {
      // 일반 텍스트는 키워드 강조 적용
      processedLines.push(`<p class="mb-3 text-gray-700 dark:text-gray-300">${highlightImportant(line)}</p>`);
    }
  }
  
  // 표가 끝나지 않은 경우 닫기
  if (inTable && tableRows.length > 0) {
    processedLines.push('<div class="overflow-x-auto my-4">');
    processedLines.push('<table class="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">');
    
    if (tableRows.length > 0) {
      processedLines.push('<thead>');
      processedLines.push('<tr class="bg-gray-100 dark:bg-gray-700">');
      tableRows[0].forEach(cell => {
        processedLines.push(`<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold text-gray-800 dark:text-gray-200">${highlightImportant(cell)}</th>`);
      });
      processedLines.push('</tr>');
      processedLines.push('</thead>');
      processedLines.push('<tbody>');
      
      for (let j = 1; j < tableRows.length; j++) {
        processedLines.push('<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">');
        tableRows[j].forEach(cell => {
          processedLines.push(`<td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">${highlightImportant(cell)}</td>`);
        });
        processedLines.push('</tr>');
      }
      processedLines.push('</tbody>');
    }
    
    processedLines.push('</table>');
    processedLines.push('</div>');
  }
  
  // 리스트가 끝나지 않은 경우 닫기
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('\n');
}

