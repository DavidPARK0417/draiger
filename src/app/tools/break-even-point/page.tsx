'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { renderMarkdown as renderMarkdownCommon } from '@/utils/markdown-renderer';
import { AIServiceNotice } from '@/components/AIServiceNotice';
import { AIGeneratedContent } from '@/components/AIGeneratedContent';

export default function BreakEvenPointPage() {
  const [productName, setProductName] = useState<string>('');
  const [fixedCost, setFixedCost] = useState<number>(0);
  const [variableCost, setVariableCost] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
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

  const handleCalculate = () => {
    console.log('=== 손익분기점 계산 ===');
    console.log('고정비:', fixedCost);
    console.log('변동비:', variableCost);
    console.log('판매가:', sellingPrice);
  };

  // AI로 손익분기점 정보 추정
  const handleAIEstimate = async () => {
    if (!productName.trim()) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }

    console.log('=== AI 손익분기점 정보 추정 시작 ===', productName);
    setIsLoading(true);

    try {
      const response = await fetch('/api/estimate-break-even', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: productName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API 오류:', result.error);
        alert(result.error || '손익분기점 정보 추정에 실패했습니다.');
        return;
      }

      if (result.success && result.data) {
        console.log('AI 추정 결과:', result.data);
        // 기존 값이 0이 아닌 경우 유지, 0인 경우만 AI 결과로 채우기
        if (fixedCost === 0) {
          setFixedCost(result.data.fixedCost);
        }
        if (variableCost === 0) {
          setVariableCost(result.data.variableCost);
        }
        if (sellingPrice === 0) {
          setSellingPrice(result.data.sellingPrice);
        }
      } else {
        console.error('응답 형식 오류:', result);
        alert('손익분기점 정보 추정에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 추정 오류:', error);
      alert('손익분기점 정보 추정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 단위당 기여이익 = 판매가 - 변동비
  const contributionMargin = sellingPrice - variableCost;
  // 손익분기점 수량 = 고정비 / 단위당 기여이익
  const breakEvenQuantity = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
  // 손익분기점 매출 = 손익분기점 수량 × 판매가
  const breakEvenRevenue = breakEvenQuantity * sellingPrice;

  // AI 종합 분석 함수
  const handleAIAnalysis = async () => {
    if (fixedCost === 0 && variableCost === 0 && sellingPrice === 0) {
      alert('먼저 계산을 수행해주세요.');
      return;
    }

    if (contributionMargin <= 0) {
      alert('손익분기점을 계산할 수 없습니다. 판매가가 변동비보다 높아야 합니다.');
      return;
    }

    console.log('=== AI 손익분기점 종합 분석 시작 ===');
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const response = await fetch('/api/analyze-break-even', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          fixedCost,
          variableCost,
          sellingPrice,
          contributionMargin,
          breakEvenQuantity,
          breakEvenRevenue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API 오류:', result.error);
        alert(result.error || '손익분기점 분석에 실패했습니다.');
        return;
      }

      if (result.success && result.analysis) {
        console.log('AI 분석 완료');
        setAiAnalysis(result.analysis);
      } else {
        console.error('응답 형식 오류:', result);
        alert('손익분기점 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('손익분기점 분석 중 오류가 발생했습니다.');
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
    const filename = `AI_분석_결과_손익분기점계산기_${timestamp}.md`;
    
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
  const costStructureData = [
    {
      name: '고정비',
      value: fixedCost,
      fill: '#ef4444',
    },
    {
      name: '변동비 (1개당)',
      value: variableCost,
      fill: '#f59e0b',
    },
    {
      name: '판매가 (1개당)',
      value: sellingPrice,
      fill: '#10b981',
    },
    {
      name: '기여이익 (1개당)',
      value: contributionMargin,
      fill: '#3b82f6',
    },
  ].filter(item => item.value > 0);

  const breakEvenAnalysisData = [
    {
      name: '손익분기점 수량',
      value: Math.ceil(breakEvenQuantity),
      fill: '#8b5cf6',
    },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          손익분기점 계산기
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          고정비와 변동비를 기반으로 손익분기점을 계산하여 최소 판매 목표를 설정하세요
        </p>

        {/* AI 서비스 제공 사실 고지 */}
        <AIServiceNotice />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                상품명
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    console.log('상품명 변경:', e.target.value);
                    setProductName(e.target.value);
                  }}
                  placeholder="예: 스마트폰 케이스, 온라인 강의 등"
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleAIEstimate}
                  disabled={isLoading || !productName.trim()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium whitespace-nowrap shadow-sm hover:shadow text-sm sm:text-base"
                  title="AI로 손익분기점 정보 자동 입력"
                >
                  {isLoading ? 'AI 분석 중...' : '🤖 AI 추정'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                총 고정비 (월세, 인건비 등) (원)
              </label>
              <input
                type="number"
                value={fixedCost || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('고정비 변경:', value);
                  setFixedCost(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                제품 1개당 변동비 (원가 등) (원)
              </label>
              <input
                type="number"
                value={variableCost || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('변동비 변경:', value);
                  setVariableCost(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                제품 1개당 판매가 (원)
              </label>
              <input
                type="number"
                value={sellingPrice || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('판매가 변경:', value);
                  setSellingPrice(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium shadow-sm hover:shadow text-sm sm:text-base"
            >
              계산하기
            </button>
          </div>

          {(fixedCost > 0 || variableCost > 0 || sellingPrice > 0) && (
            <div className="mt-8 space-y-4">
              {contributionMargin <= 0 && sellingPrice > 0 && variableCost > 0 ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 shadow-sm">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    경고
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    판매가가 변동비보다 낮거나 같아서 손익분기점을 달성할 수 없습니다.
                    판매가를 변동비보다 높게 설정해주세요.
                  </p>
                </div>
              ) : breakEvenQuantity > 0 ? (
                <>
                  <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <h3 className="text-lg sm:text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-3 sm:mb-4">
                      목표 달성 메시지
                    </h3>
                    <p className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      손익분기점을 넘기려면 매월{' '}
                      <span className="text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-300">
                        {Math.ceil(breakEvenQuantity).toLocaleString('ko-KR')}개
                      </span>
                      의 제품을 판매해야 합니다.
                    </p>
                  </div>

                  <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                    <h3 className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-200 mb-2 sm:mb-3">
                      계산 결과
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">단위당 기여이익:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {contributionMargin.toLocaleString('ko-KR')} 원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">손익분기점 수량:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {breakEvenQuantity.toFixed(2)} 개
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-300">손익분기점 매출:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {breakEvenRevenue.toLocaleString('ko-KR')} 원
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI 종합 분석 버튼 */}
                  {breakEvenQuantity > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow text-sm sm:text-base"
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
                          {/* 비용 구조 막대 차트 */}
                          {costStructureData.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                비용 구조 분석
                              </h4>
                              <ResponsiveContainer width="100%" height={chartHeight}>
                                <BarChart data={costStructureData}>
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
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                                      borderRadius: '8px',
                                      color: isDarkMode ? '#f3f4f6' : '#111827'
                                    }}
                                    formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                                  />
                                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {costStructureData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Bar>
                                  <Legend 
                                    wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          {/* 손익분기점 파이 차트 */}
                          {breakEvenAnalysisData.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                손익분기점 분석
                              </h4>
                              <ResponsiveContainer width="100%" height={chartHeight}>
                                <PieChart>
                                  <Pie
                                    data={breakEvenAnalysisData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value.toLocaleString('ko-KR')}개`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {breakEvenAnalysisData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                                      borderRadius: '8px',
                                      color: isDarkMode ? '#f3f4f6' : '#111827'
                                    }}
                                    formatter={(value: number) => `${value.toLocaleString('ko-KR')}개`}
                                  />
                                  <Legend 
                                    wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                                  />
                                </PieChart>
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
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
            계산 공식 안내
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>단위당 기여이익</strong> = 판매가 - 변동비
            </li>
            <li>
              <strong>손익분기점 수량</strong> = 고정비 ÷ 단위당 기여이익
            </li>
            <li>
              <strong>손익분기점 매출</strong> = 손익분기점 수량 × 판매가
            </li>
          </ul>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>손익분기점이란?</strong> 순이익이 0원이 되는 판매 수량입니다. 
              이 수량을 넘어서야 비로소 이익이 발생하기 시작합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

