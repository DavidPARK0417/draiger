'use client';

import { useState } from 'react';
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
import { InfoTooltip } from '@/components/Tooltip';

export default function BudgetCalculatorPage() {
  const [productName, setProductName] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [targetConversions, setTargetConversions] = useState<number>(0);
  const [cpc, setCpc] = useState<number>(0);
  const [conversionRate, setConversionRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // AI 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  // 실시간 계산 값들
  const expectedRevenue = targetConversions * sellingPrice;
  const requiredClicks = conversionRate > 0 ? targetConversions / (conversionRate / 100) : 0;
  const requiredBudget = requiredClicks * cpc;
  const totalCost = targetConversions * cost;
  const finalProfit = expectedRevenue - (requiredBudget + totalCost);
  const roas = requiredBudget > 0 ? (expectedRevenue / requiredBudget) * 100 : 0;

  const handleCalculate = () => {
    console.log('=== 수익성 분석 계산 ===');
    console.log('판매가:', sellingPrice);
    console.log('원가:', cost);
    console.log('목표 전환수:', targetConversions);
    console.log('CPC:', cpc);
    console.log('전환율:', conversionRate);
    console.log('예상 매출:', expectedRevenue);
    console.log('필요 광고비:', requiredBudget);
    console.log('총 원가:', totalCost);
    console.log('최종 순이익:', finalProfit);
    console.log('ROAS:', roas);
  };

  // AI로 광고 예산 정보 추정
  const handleAIEstimate = async () => {
    if (!productName.trim()) {
      alert('상품명을 먼저 입력해주세요.');
      return;
    }

    console.log('=== AI 광고 예산 정보 추정 시작 ===', productName);
    setIsLoading(true);

    try {
      const response = await fetch('/api/estimate-budget', {
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
        alert(result.error || '광고 예산 정보 추정에 실패했습니다.');
        return;
      }

      if (result.success && result.data) {
        console.log('AI 추정 결과:', result.data);
        // 기존 값이 0이 아닌 경우 유지, 0인 경우만 AI 결과로 채우기
        if (sellingPrice === 0 && result.data.sellingPrice) {
          setSellingPrice(result.data.sellingPrice);
        }
        if (cost === 0 && result.data.cost) {
          setCost(result.data.cost);
        }
        if (targetConversions === 0) {
          setTargetConversions(result.data.targetConversions);
        }
        if (cpc === 0) {
          setCpc(result.data.cpc);
        }
        if (conversionRate === 0) {
          setConversionRate(result.data.conversionRate);
        }
      } else {
        console.error('응답 형식 오류:', result);
        alert('광고 예산 정보 추정에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 추정 오류:', error);
      alert('광고 예산 정보 추정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  // AI 종합 분석 함수
  const handleAIAnalysis = async () => {
    if (targetConversions === 0 && cpc === 0 && conversionRate === 0) {
      alert('먼저 계산을 수행해주세요.');
      return;
    }

    console.log('=== AI 광고 예산 종합 분석 시작 ===');
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const response = await fetch('/api/analyze-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          targetConversions,
          cpc,
          conversionRate,
          requiredClicks,
          requiredBudget,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API 오류:', result.error);
        alert(result.error || '광고 예산 분석에 실패했습니다.');
        return;
      }

      if (result.success && result.analysis) {
        console.log('AI 분석 완료');
        setAiAnalysis(result.analysis);
      } else {
        console.error('응답 형식 오류:', result);
        alert('광고 예산 분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('광고 예산 분석 중 오류가 발생했습니다.');
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
    const filename = `AI_분석_결과_광고예산계산기_${timestamp}.md`;
    
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
  const budgetBreakdownData = [
    {
      name: '필요한 예산',
      value: requiredBudget,
      fill: '#3b82f6',
    },
  ].filter(item => item.value > 0);

  const conversionFlowData = [
    {
      name: '필요한 클릭수',
      value: Math.ceil(requiredClicks),
      fill: '#10b981',
    },
    {
      name: '목표 전환수',
      value: targetConversions,
      fill: '#8b5cf6',
    },
  ].filter(item => item.value > 0);

  const costAnalysisData = [
    {
      name: 'CPC',
      value: cpc,
      fill: '#f59e0b',
    },
    {
      name: '전환당 비용',
      value: requiredClicks > 0 ? requiredBudget / targetConversions : 0,
      fill: '#ef4444',
    },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          광고 수익성 분석 도구
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          판매가와 원가를 입력하면 광고비를 제외한 최종 순이익과 광고 효율(ROAS)을 자동으로 계산해드려요
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                상품명 또는 목표
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    console.log('상품명 변경:', e.target.value);
                    setProductName(e.target.value);
                  }}
                  placeholder="예: 스마트폰 케이스, 온라인 강의 등"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                />
                <button
                  onClick={handleAIEstimate}
                  disabled={isLoading || !productName.trim()}
                  className="px-4 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium whitespace-nowrap shadow-md hover:shadow-lg"
                  title="AI로 광고 예산 정보 자동 입력"
                >
                  {isLoading ? 'AI 분석 중...' : '🤖 AI 추정'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <InfoTooltip text="상품을 고객에게 판매하는 가격이에요. 예를 들어 상품을 10,000원에 판다면 판매가는 10,000원이에요.">
                  상품 판매가 (원)
                </InfoTooltip>
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <InfoTooltip text="상품을 만들거나 구매하는데 드는 비용이에요. 배송비도 포함해서 입력하세요. 예를 들어 상품 원가가 5,000원이고 배송비가 1,000원이면 총 6,000원을 입력하세요.">
                  상품 원가 (개당 배송비 포함, 원)
                </InfoTooltip>
              </label>
              <input
                type="number"
                value={cost || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('원가 변경:', value);
                  setCost(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <InfoTooltip text="이번 광고로 몇 명의 고객을 얻고 싶은지 목표 수예요. 예를 들어 10명의 고객을 얻고 싶다면 목표 전환수는 10이에요.">
                  목표 전환수
                </InfoTooltip>
              </label>
              <input
                type="number"
                value={targetConversions || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('목표 전환수 변경:', value);
                  setTargetConversions(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <InfoTooltip text="광고를 클릭한 사람 1명당 내야 하는 비용이에요. 예를 들어 광고비 10,000원으로 100번 클릭을 받았다면 CPC는 100원이에요.">
                  예상 클릭당 비용 (CPC, 원)
                </InfoTooltip>
              </label>
              <input
                type="number"
                value={cpc || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('CPC 변경:', value);
                  setCpc(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                <InfoTooltip text="광고를 본 사람 중에서 실제로 구매한 사람의 비율이에요. 예를 들어 100명이 봤는데 5명이 샀다면 전환율은 5%예요.">
                  예상 전환율 (%)
                </InfoTooltip>
              </label>
              <input
                type="number"
                step="0.01"
                value={conversionRate || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log('전환율 변경:', value);
                  setConversionRate(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
              />
            </div>

            <button
              onClick={handleCalculate}
              className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              계산하기
            </button>
          </div>

          {(sellingPrice > 0 || cost > 0 || targetConversions > 0 || cpc > 0 || conversionRate > 0) && (
            <div className="mt-8 space-y-4">
              {/* 최종 순이익 강조 표시 */}
              {(sellingPrice > 0 && targetConversions > 0 && cpc > 0 && conversionRate > 0) && (
                <div className={`p-6 sm:p-8 rounded-2xl border-2 shadow-lg ${
                  finalProfit >= 0 
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700' 
                    : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                }`}>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      최종 순이익
                    </p>
                    <p className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 ${
                      finalProfit >= 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {finalProfit >= 0 ? '+' : ''}{finalProfit.toLocaleString('ko-KR')} 원
                    </p>
                    {finalProfit < 0 && (
                      <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/50 rounded-xl border border-red-300 dark:border-red-700">
                        <p className="text-red-800 dark:text-red-200 font-semibold text-sm sm:text-base">
                          ⚠️ 현재 구조로는 손해가 발생할 수 있어요
                        </p>
                        <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm mt-2">
                          판매가를 올리거나, 원가를 낮추거나, 광고비를 줄여야 해요
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 상세 계산 결과 */}
              <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  📊 상세 계산 결과
                </h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">예상 매출:</span>
                    <span className="font-semibold text-foreground">
                      {expectedRevenue > 0 ? expectedRevenue.toLocaleString('ko-KR') : '-'} 원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">필요한 클릭수:</span>
                    <span className="font-semibold text-foreground">
                      {requiredClicks > 0 ? Math.ceil(requiredClicks).toLocaleString('ko-KR') : '-'} 회
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">필요 광고비:</span>
                    <span className="font-semibold text-foreground">
                      {requiredBudget > 0 ? Math.ceil(requiredBudget).toLocaleString('ko-KR') : '-'} 원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">총 원가:</span>
                    <span className="font-semibold text-foreground">
                      {totalCost > 0 ? totalCost.toLocaleString('ko-KR') : '-'} 원
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 dark:text-gray-300">
                      <InfoTooltip text="광고 효율을 나타내는 지표예요. 100%면 광고비만큼 매출이 나왔다는 뜻이고, 200%면 광고비의 2배 매출이 나왔다는 뜻이에요. 숫자가 클수록 광고가 효율적이에요.">
                        광고 효율 (ROAS)
                      </InfoTooltip>:
                    </span>
                    <span className={`font-semibold ${
                      roas >= 200 ? 'text-emerald-600 dark:text-emerald-400' :
                      roas >= 100 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {roas > 0 ? roas.toFixed(2) : '-'} %
                    </span>
                  </div>
                </div>
              </div>

              {/* AI 종합 분석 버튼 */}
              <div className="mt-6">
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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

              {/* AI 분석 결과 표시 */}
              {aiAnalysis && (
                <div className="mt-6 space-y-6">
                  {/* 다운로드 버튼 */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadAnalysis}
                      className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
                      title="AI 분석 결과 다운로드"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      다운로드
                    </button>
                  </div>
                  
                  {/* 시각화 차트 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">
                      📊 데이터 시각화
                    </h3>
                    
                    <div className="space-y-6">
                      {/* 예산 구조 막대 차트 */}
                      {budgetBreakdownData.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-foreground">
                            예산 구조 분석
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={budgetBreakdownData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" />
                              <YAxis 
                                tick={{ fill: 'currentColor', fontSize: 12 }} 
                                stroke="currentColor"
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #ccc',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {budgetBreakdownData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                              <Legend />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* 전환 흐름 파이 차트 */}
                      {conversionFlowData.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-foreground">
                            전환 흐름 분석
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={conversionFlowData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value.toLocaleString('ko-KR')}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {conversionFlowData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #ccc',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number) => `${value.toLocaleString('ko-KR')}`}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* 비용 분석 막대 차트 */}
                      {costAnalysisData.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-foreground">
                            비용 분석
                          </h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={costAnalysisData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} stroke="currentColor" />
                              <YAxis 
                                tick={{ fill: 'currentColor', fontSize: 12 }} 
                                stroke="currentColor"
                                tickFormatter={(value) => `${value.toLocaleString('ko-KR')}원`}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid #ccc',
                                  borderRadius: '8px'
                                }}
                                formatter={(value: number) => `${value.toLocaleString('ko-KR')}원`}
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {costAnalysisData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Bar>
                              <Legend />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI 텍스트 분석 결과 */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnalysis) }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold mb-3 text-foreground">
            계산 공식 안내
          </h2>
          <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>예상 매출</strong> = 목표 전환수 × 판매가
            </li>
            <li>
              <strong>필요한 클릭수</strong> = 목표 전환수 ÷ (전환율 ÷ 100)
            </li>
            <li>
              <strong>필요 광고비</strong> = 필요한 클릭수 × CPC
            </li>
            <li>
              <strong>총 원가</strong> = 목표 전환수 × 원가
            </li>
            <li>
              <strong>최종 순이익</strong> = 예상 매출 - (필요 광고비 + 총 원가)
            </li>
            <li>
              <strong>광고 효율 (ROAS)</strong> = (예상 매출 ÷ 필요 광고비) × 100
            </li>
          </ul>
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
              💡 <strong>ROAS 해석:</strong> 100% 이상이면 광고가 수익을 내고 있다는 뜻이에요. 200% 이상이면 매우 효율적인 광고예요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

