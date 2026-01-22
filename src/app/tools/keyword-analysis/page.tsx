'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { renderMarkdown as renderMarkdownCommon } from '@/utils/markdown-renderer';
import { InfoTooltip } from '@/components/Tooltip';
import { AIServiceNotice } from '@/components/AIServiceNotice';
import { AIGeneratedContent } from '@/components/AIGeneratedContent';

interface Keyword {
  id: string;
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  // 네이버 검색광고 API 데이터
  naverSearchVolume?: number; // 네이버 공식 검색량 (PC + 모바일 합산)
  naverPcSearchVolume?: number; // PC 검색량
  naverMobileSearchVolume?: number; // 모바일 검색량
  naverCompetition?: string | null; // 네이버 경쟁도 텍스트 (높음/중간/낮음)
  naverCompetitionColor?: string | null; // 네이버 경쟁도 색상 (red/orange/green)
  naverCpc?: number | null; // 네이버 CPC (표시용)
}

export default function KeywordAnalysisPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([
    {
      id: '1',
      keyword: '',
      searchVolume: 0,
      competition: 0,
      cpc: 0,
    },
  ]);
  const [loadingKeywordId, setLoadingKeywordId] = useState<string | null>(null);
  const [loadingNaverKeywordId, setLoadingNaverKeywordId] = useState<string | null>(null);
  
  // AI 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // 차트 반응형 및 다크모드 상태
  const [chartHeight, setChartHeight] = useState(300);
  const [chartFontSize, setChartFontSize] = useState(12);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 화면 크기에 따라 차트 높이 및 폰트 크기 조정
  useEffect(() => {
    const updateChartSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChartHeight(200); // 모바일
        setChartFontSize(10);
        setIsMobile(true);
      } else if (width < 1024) {
        setChartHeight(250); // 태블릿
        setChartFontSize(11);
        setIsMobile(false);
      } else {
        setChartHeight(300); // 데스크탑
        setChartFontSize(12);
        setIsMobile(false);
      }
    };

    // 다크모드 감지 함수
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    updateChartSize();
    checkDarkMode();

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', updateChartSize);
    
    // 다크모드 변경 감지를 위한 MutationObserver
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      window.removeEventListener('resize', updateChartSize);
      observer.disconnect();
    };
  }, []);

  const handleAddKeyword = () => {
    console.log('키워드 추가');
    const newKeyword: Keyword = {
      id: Date.now().toString(),
      keyword: '',
      searchVolume: 0,
      competition: 0,
      cpc: 0,
    };
    setKeywords([...keywords, newKeyword]);
  };

  const handleDeleteKeyword = (id: string) => {
    console.log('키워드 삭제:', id);
    if (keywords.length > 1) {
      setKeywords(keywords.filter((k) => k.id !== id));
    }
  };

  const handleInputChange = (id: string, field: keyof Keyword, value: string | number) => {
    console.log(`입력 변경 - ${id}: ${field} = ${value}`);
    setKeywords(
      keywords.map((k) =>
        k.id === id ? { ...k, [field]: value } : k
      )
    );
  };

  // AI로 키워드 정보 추정
  const handleAIEstimate = async (id: string) => {
    const keyword = keywords.find((k) => k.id === id);
    if (!keyword || !keyword.keyword.trim()) {
      alert('키워드를 먼저 입력해주세요.');
      return;
    }

    console.log('=== AI 키워드 정보 추정 시작 ===', keyword.keyword);
    setLoadingKeywordId(id);

    try {
      const response = await fetch('/api/estimate-keyword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.keyword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API 오류:', result.error);
        alert(result.error || '키워드 정보 추정에 실패했습니다.');
        return;
      }

      if (result.success && result.data) {
        console.log('AI 추정 결과:', result.data);
        console.log('기존 키워드 정보:', keyword);
        setKeywords(
          keywords.map((k) =>
            k.id === id
              ? {
                  ...k,
                  // 기존 값이 0이 아닌 경우 유지, 0인 경우만 AI 결과로 채우기
                  searchVolume: k.searchVolume !== 0 ? k.searchVolume : result.data.searchVolume,
                  competition: k.competition !== 0 ? k.competition : result.data.competition,
                  cpc: k.cpc !== 0 ? k.cpc : result.data.cpc,
                }
              : k
          )
        );
      } else {
        console.error('응답 형식 오류:', result);
        alert('키워드 정보 추정에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 추정 오류:', error);
      alert('키워드 정보 추정 중 오류가 발생했습니다.');
    } finally {
      setLoadingKeywordId(null);
    }
  };

  // 네이버 검색광고 API로 검색량 조회
  const handleNaverSearch = async (id: string) => {
    const keyword = keywords.find((k) => k.id === id);
    if (!keyword || !keyword.keyword.trim()) {
      alert('키워드를 먼저 입력해주세요.');
      return;
    }

    console.log('=== 네이버 검색광고 API 호출 시작 ===', keyword.keyword);
    setLoadingNaverKeywordId(id);

    try {
      const response = await fetch('/api/naver-keyword-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword.keyword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('네이버 API 오류:', result.error);
        
        // 환경 변수 미설정 오류인 경우 상세 안내
        if (result.required) {
          const missing = Object.entries(result.required)
            .filter(([, isMissing]) => isMissing)
            .map(([key]) => key)
            .join(', ');
          alert(
            `네이버 API 인증 정보가 설정되지 않았습니다.\n\n누락된 환경 변수: ${missing}\n\n.env.local 파일에 다음 변수를 추가해주세요:\n- NAVER_CUSTOMER_ID\n- NAVER_ACCESS_LICENSE\n- NAVER_SECRET_KEY`
          );
        } else {
          alert(result.error || '네이버 검색량 조회에 실패했습니다.');
        }
        return;
      }

      if (result.success && result.data) {
        console.log('네이버 검색량 조회 결과:', result.data);
        setKeywords(
          keywords.map((k) =>
            k.id === id
              ? {
                  ...k,
                  naverSearchVolume: result.data.totalSearchVolume,
                  naverPcSearchVolume: result.data.pcSearchVolume,
                  naverMobileSearchVolume: result.data.mobileSearchVolume,
                  // 네이버 검색량이 있고 기존 검색량이 0이면 네이버 검색량으로 채우기
                  searchVolume: k.searchVolume !== 0 ? k.searchVolume : result.data.totalSearchVolume,
                  // 경쟁도: 네이버 데이터가 있고 기존 값이 0이면 네이버 경쟁도로 채우기
                  competition: (k.competition !== 0 && k.competition !== undefined) 
                    ? k.competition 
                    : (result.data.competition || k.competition || 0),
                  // CPC: 네이버 입찰가 데이터가 있으면 사용, 없으면 기존 값 유지
                  cpc: result.data.cpc && result.data.cpc > 0 
                    ? result.data.cpc 
                    : (k.cpc !== 0 ? k.cpc : 0),
                  // 네이버 경쟁도 정보 (표시용)
                  naverCompetition: result.data.competitionText || null,
                  naverCompetitionColor: result.data.competitionColor || null,
                  // 네이버 CPC 여부 (표시용)
                  naverCpc: result.data.cpc && result.data.cpc > 0 ? result.data.cpc : null,
                }
              : k
          )
        );
      } else {
        console.error('응답 형식 오류:', result);
        alert(result.data?.message || '네이버 검색량 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('네이버 API 호출 오류:', error);
      alert('네이버 검색량 조회 중 오류가 발생했습니다.');
    } finally {
      setLoadingNaverKeywordId(null);
    }
  };

  const calculateScore = (keyword: Keyword): number => {
    if (keyword.searchVolume === 0 || keyword.cpc === 0) return 0;
    // 점수 = 검색량 / (경쟁도 * CPC)
    const score = keyword.searchVolume / (keyword.competition * keyword.cpc || 1);
    return Math.round(score * 100) / 100;
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    return scoreB - scoreA;
  });

  // AI 종합 분석 함수
  const handleAIAnalysis = async () => {
    const validKeywords = keywords.filter(k => k.keyword.trim() && (k.searchVolume > 0 || k.cpc > 0 || k.competition > 0));
    
    if (validKeywords.length === 0) {
      alert('분석할 수 있는 키워드 데이터가 없습니다. 키워드 정보를 입력해주세요.');
      return;
    }

    console.log('=== AI 키워드 종합 분석 시작 ===');
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const keywordsWithScore = validKeywords.map(k => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        competition: k.competition,
        cpc: k.cpc,
        score: calculateScore(k),
      }));

      const response = await fetch('/api/analyze-keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: keywordsWithScore,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API 오류:', result.error);
        alert(result.error || '키워드 분석에 실패했습니다.');
        return;
      }

      if (result.success && result.analysis) {
        console.log('AI 분석 완료');
        setAiAnalysis(result.analysis);
      } else {
        console.error('응답 형식 오류:', result);
        alert('키워드 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('키워드 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 마크다운 렌더링 함수 (공통 함수 사용)
  const renderMarkdown = (text: string) => {
    return renderMarkdownCommon(text);
  };

  // AI 분석 결과 다운로드 함수
  const handleDownloadAnalysis = () => {
    if (!aiAnalysis) return;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `AI_분석_결과_키워드분석_${timestamp}.md`;
    
    const blob = new Blob([aiAnalysis], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('AI 분석 결과 다운로드 완료:', filename);
  };

  // 차트 데이터 준비
  const validKeywordsForChart = keywords.filter(k => k.keyword.trim() && (k.searchVolume > 0 || k.cpc > 0 || k.competition > 0));
  
  const keywordScoreData = validKeywordsForChart.map(k => ({
    name: k.keyword,
    점수: calculateScore(k),
  })).filter(item => item.점수 > 0);

  const keywordComparisonData = validKeywordsForChart.map(k => ({
    name: k.keyword,
    검색량: k.searchVolume,
    CPC: k.cpc,
    경쟁도: k.competition * 10, // 시각화를 위해 10배
  }));


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          키워드 분석 도구
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          키워드의 검색량, 경쟁도, CPC를 분석하여 최적의 키워드를 찾아보세요
        </p>

        {/* AI 서비스 제공 사실 고지 */}
        <AIServiceNotice />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8 overflow-x-auto">
          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">키워드</th>
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">검색량</th>
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">경쟁도 (1-10)</th>
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">
                    <InfoTooltip text="광고를 클릭한 사람 1명당 내야 하는 비용이에요. 예를 들어 광고비 10,000원으로 100번 클릭을 받았다면 CPC는 100원이에요.">
                      CPC (원)
                    </InfoTooltip>
                  </th>
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">점수</th>
                  <th className="text-left p-3 font-semibold text-sm text-gray-900 dark:text-gray-100">삭제</th>
                </tr>
              </thead>
              <tbody>
              {keywords.map((keyword) => {
                const score = calculateScore(keyword);
                const isTopScore = sortedKeywords[0]?.id === keyword.id && score > 0;

                return (
                  <tr
                    key={keyword.id}
                    className={`border-b border-gray-200 dark:border-gray-800 transition-colors ${
                      isTopScore
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={keyword.keyword}
                            onChange={(e) => handleInputChange(keyword.id, 'keyword', e.target.value)}
                            placeholder="키워드 입력"
                            className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleAIEstimate(keyword.id)}
                            disabled={loadingKeywordId === keyword.id || !keyword.keyword.trim()}
                            className="px-3 py-1 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow"
                            title="AI로 키워드 정보 자동 입력"
                          >
                            {loadingKeywordId === keyword.id ? 'AI 분석 중...' : '🤖 AI 추정'}
                          </button>
                          <button
                            onClick={() => handleNaverSearch(keyword.id)}
                            disabled={loadingNaverKeywordId === keyword.id || !keyword.keyword.trim()}
                            className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow"
                            title="네이버 검색광고 API로 공식 검색량 조회"
                          >
                            {loadingNaverKeywordId === keyword.id ? '조회 중...' : '🔍 네이버 검색량'}
                          </button>
                        </div>
                        {/* 네이버 검색량 표시 */}
                        {keyword.naverSearchVolume !== undefined && (
                          <div className="mt-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-semibold text-blue-700 dark:text-blue-300">
                                네이버 공식 데이터:
                              </span>
                              <span className="text-blue-600 dark:text-blue-400">
                                총 {keyword.naverSearchVolume.toLocaleString()}회
                              </span>
                              {keyword.naverPcSearchVolume !== undefined && keyword.naverMobileSearchVolume !== undefined && (
                                <span className="text-blue-500 dark:text-blue-500 text-[10px]">
                                  (PC: {keyword.naverPcSearchVolume.toLocaleString()}, 모바일: {keyword.naverMobileSearchVolume.toLocaleString()})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <input
                          type="number"
                          value={keyword.searchVolume || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'searchVolume', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        {keyword.naverSearchVolume !== undefined && keyword.naverSearchVolume > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            네이버: {keyword.naverSearchVolume.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={keyword.competition || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'competition', parseFloat(e.target.value) || 0)
                          }
                          placeholder="1-10"
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-foreground text-sm"
                        />
                        {/* 네이버 경쟁도 표시 */}
                        {keyword.naverCompetition && (
                          <div className="flex items-center gap-1.5">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                keyword.naverCompetitionColor === 'red' 
                                  ? 'bg-red-500' 
                                  : keyword.naverCompetitionColor === 'orange'
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              title={`네이버 경쟁도: ${keyword.naverCompetition}`}
                            />
                            <span 
                              className={`text-xs font-medium ${
                                keyword.naverCompetitionColor === 'red' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : keyword.naverCompetitionColor === 'orange'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              네이버: {keyword.naverCompetition}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <input
                          type="number"
                          value={keyword.cpc || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'cpc', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        {/* 네이버 CPC 표시 */}
                        {keyword.naverCpc && keyword.naverCpc > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            네이버 예상: 약 {keyword.naverCpc.toLocaleString()}원
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                              (최근 30일 평균)
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {score > 0 ? score.toFixed(2) : '-'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDeleteKeyword(keyword.id)}
                        disabled={keywords.length === 1}
                        className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm transition-all duration-300 shadow-sm hover:shadow"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* 모바일/태블릿 카드 뷰 */}
          <div className="lg:hidden space-y-4">
            {keywords.map((keyword) => {
              const score = calculateScore(keyword);
              const isTopScore = sortedKeywords[0]?.id === keyword.id && score > 0;

              return (
                <div
                  key={keyword.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all duration-300 shadow-sm ${
                    isTopScore
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* 키워드 입력 */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">키워드</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keyword.keyword}
                          onChange={(e) => handleInputChange(keyword.id, 'keyword', e.target.value)}
                          placeholder="키워드 입력"
                          className="flex-1 px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleAIEstimate(keyword.id)}
                          disabled={loadingKeywordId === keyword.id || !keyword.keyword.trim()}
                          className="px-3 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow"
                          title="AI로 키워드 정보 자동 입력"
                        >
                          {loadingKeywordId === keyword.id ? 'AI 분석 중...' : '🤖 AI 추정'}
                        </button>
                        <button
                          onClick={() => handleNaverSearch(keyword.id)}
                          disabled={loadingNaverKeywordId === keyword.id || !keyword.keyword.trim()}
                          className="px-3 py-2.5 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs whitespace-nowrap transition-all duration-300 shadow-sm hover:shadow"
                          title="네이버 검색광고 API로 공식 검색량 조회"
                        >
                          {loadingNaverKeywordId === keyword.id ? '조회 중...' : '🔍 네이버 검색량'}
                        </button>
                      </div>
                      {/* 네이버 검색량 표시 */}
                      {keyword.naverSearchVolume !== undefined && (
                        <div className="mt-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-blue-700 dark:text-blue-300">
                              네이버 공식 데이터:
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              총 {keyword.naverSearchVolume.toLocaleString()}회
                            </span>
                            {keyword.naverPcSearchVolume !== undefined && keyword.naverMobileSearchVolume !== undefined && (
                              <span className="text-blue-500 dark:text-blue-500 text-[10px]">
                                (PC: {keyword.naverPcSearchVolume.toLocaleString()}, 모바일: {keyword.naverMobileSearchVolume.toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 입력 필드 그리드 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">검색량</label>
                        <input
                          type="number"
                          value={keyword.searchVolume || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'searchVolume', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        {keyword.naverSearchVolume !== undefined && keyword.naverSearchVolume > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            네이버: {keyword.naverSearchVolume.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">경쟁도 (1-10)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={keyword.competition || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'competition', parseFloat(e.target.value) || 0)
                          }
                          placeholder="1-10"
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        {keyword.naverCompetition && (
                          <div className="flex items-center gap-1.5">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                keyword.naverCompetitionColor === 'red' 
                                  ? 'bg-red-500' 
                                  : keyword.naverCompetitionColor === 'orange'
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                              }`}
                              title={`네이버 경쟁도: ${keyword.naverCompetition}`}
                            />
                            <span 
                              className={`text-xs font-medium ${
                                keyword.naverCompetitionColor === 'red' 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : keyword.naverCompetitionColor === 'orange'
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              네이버: {keyword.naverCompetition}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          <InfoTooltip text="광고를 클릭한 사람 1명당 내야 하는 비용이에요. 예를 들어 광고비 10,000원으로 100번 클릭을 받았다면 CPC는 100원이에요.">
                            CPC (원)
                          </InfoTooltip>
                        </label>
                        <input
                          type="number"
                          value={keyword.cpc || ''}
                          onChange={(e) =>
                            handleInputChange(keyword.id, 'cpc', parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        />
                        {keyword.naverCpc && keyword.naverCpc > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            네이버 예상: 약 {keyword.naverCpc.toLocaleString()}원
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
                              (최근 30일 평균)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">점수</label>
                        <div className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm font-semibold">
                          {score > 0 ? score.toFixed(2) : '-'}
                        </div>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleDeleteKeyword(keyword.id)}
                        disabled={keywords.length === 1}
                        className="w-full px-4 py-2.5 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium transition-all duration-300 shadow-sm hover:shadow"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <button
              onClick={handleAddKeyword}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 font-medium shadow-sm hover:shadow border border-gray-200 dark:border-gray-600 text-sm sm:text-base"
            >
              키워드 추가
            </button>
          </div>

          {sortedKeywords[0] && calculateScore(sortedKeywords[0]) > 0 && (
            <div className="mt-6 p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm">
              <p className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-200">
                🏆 최고 점수 키워드:{' '}
                <span className="text-base sm:text-lg">{sortedKeywords[0].keyword}</span>
              </p>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                점수: {calculateScore(sortedKeywords[0]).toFixed(2)}
              </p>
            </div>
          )}

          {/* AI 종합 분석 버튼 */}
          {validKeywordsForChart.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="w-full px-4 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow text-sm sm:text-base"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    🤖 AI 종합 분석
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI 분석 결과 표시 */}
          {aiAnalysis && (
            <div className="mt-6 space-y-6">
              {/* 다운로드 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadAnalysis}
                  className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium flex items-center gap-2 shadow-sm hover:shadow text-sm sm:text-base"
                  title="AI 분석 결과 다운로드"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  다운로드
                </button>
              </div>
              
              {/* 시각화 차트 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30">
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
                  📊 데이터 시각화
                </h3>
                
                <div className="space-y-6">
                  {/* 키워드 점수 비교 막대 차트 */}
                  {keywordScoreData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        키워드 점수 비교
                      </h4>
                      <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart data={keywordScoreData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: 'currentColor', fontSize: chartFontSize }} 
                            stroke="currentColor"
                            angle={isMobile ? -45 : 0}
                            textAnchor={isMobile ? 'end' : 'middle'}
                            height={isMobile ? 60 : 30}
                          />
                          <YAxis 
                            tick={{ fill: 'currentColor', fontSize: chartFontSize }} 
                            stroke="currentColor"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                              borderRadius: '8px',
                              color: isDarkMode ? '#f3f4f6' : '#111827'
                            }}
                            formatter={(value: number) => value.toFixed(2)}
                          />
                          <Legend 
                            wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                          />
                          <Bar dataKey="점수" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* 키워드 비교 막대 차트 */}
                  {keywordComparisonData.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                        키워드 비교 (검색량, CPC, 경쟁도)
                      </h4>
                      <ResponsiveContainer width="100%" height={chartHeight}>
                        <BarChart data={keywordComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: 'currentColor', fontSize: chartFontSize }} 
                            stroke="currentColor"
                            angle={isMobile ? -45 : 0}
                            textAnchor={isMobile ? 'end' : 'middle'}
                            height={isMobile ? 60 : 30}
                          />
                          <YAxis 
                            tick={{ fill: 'currentColor', fontSize: chartFontSize }} 
                            stroke="currentColor"
                            yAxisId="left"
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <YAxis 
                            yAxisId="right" 
                            orientation="right"
                            tick={{ fill: 'currentColor', fontSize: chartFontSize }} 
                            stroke="currentColor"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                              border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                              borderRadius: '8px',
                              color: isDarkMode ? '#f3f4f6' : '#111827'
                            }}
                          />
                          <Bar yAxisId="left" dataKey="검색량" fill="#10b981" radius={[8, 8, 0, 0]} />
                          <Bar yAxisId="right" dataKey="CPC" fill="#ef4444" radius={[8, 8, 0, 0]} />
                          <Bar yAxisId="right" dataKey="경쟁도" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                          <Legend 
                            wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* AI 텍스트 분석 결과 */}
              <AIGeneratedContent>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnalysis) }}
                  />
                </div>
              </AIGeneratedContent>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
            점수 계산 공식
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>점수</strong> = 검색량 ÷ (경쟁도 × CPC)
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            점수가 높을수록 효율적인 키워드입니다. 검색량이 높고, 경쟁도와 CPC가 낮을수록 좋습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

