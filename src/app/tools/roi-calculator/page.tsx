"use client";

import { useState, useEffect } from "react";
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
} from "recharts";
import { renderMarkdown as renderMarkdownCommon } from "@/utils/markdown-renderer";
import { InfoTooltip } from "@/components/Tooltip";
import { AIServiceNotice } from "@/components/AIServiceNotice";
import { AIGeneratedContent } from "@/components/AIGeneratedContent";

export default function ROICalculatorPage() {
  const [productName, setProductName] = useState<string>("");
  const [investment, setInvestment] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // AI 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  
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
    console.log("=== ROI 계산 ===");
    console.log("투자금:", investment);
    console.log("매출:", revenue);
    console.log("비용:", cost);
  };

  // AI로 ROI 정보 추정
  const handleAIEstimate = async () => {
    if (!productName.trim()) {
      alert("상품명을 먼저 입력해주세요.");
      return;
    }

    console.log("=== AI ROI 정보 추정 시작 ===", productName);
    setIsLoading(true);

    try {
      const response = await fetch("/api/estimate-roi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName: productName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API 오류:", result.error);
        alert(result.error || "ROI 정보 추정에 실패했습니다.");
        return;
      }

      if (result.success && result.data) {
        console.log("AI 추정 결과:", result.data);
        // 기존 값이 0이 아닌 경우 유지, 0인 경우만 AI 결과로 채우기
        if (investment === 0) {
          setInvestment(result.data.investment);
        }
        if (revenue === 0) {
          setRevenue(result.data.revenue);
        }
        if (cost === 0) {
          setCost(result.data.cost);
        }
      } else {
        console.error("응답 형식 오류:", result);
        alert("ROI 정보 추정에 실패했습니다.");
      }
    } catch (error) {
      console.error("AI 추정 오류:", error);
      alert("ROI 정보 추정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const netProfit = revenue - cost;
  const roi =
    investment > 0 ? ((netProfit - investment) / investment) * 100 : 0;
  const roas = investment > 0 ? revenue / investment : 0;

  // AI 종합 분석 함수
  const handleAIAnalysis = async () => {
    if (investment === 0 && revenue === 0 && cost === 0) {
      alert("먼저 계산을 수행해주세요.");
      return;
    }

    console.log("=== AI ROI 종합 분석 시작 ===");
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const response = await fetch("/api/analyze-roi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          investment,
          revenue,
          cost,
          netProfit,
          roi,
          roas,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API 오류:", result.error);
        alert(result.error || "ROI 분석에 실패했습니다.");
        return;
      }

      if (result.success && result.analysis) {
        console.log("AI 분석 완료");
        setAiAnalysis(result.analysis);
      } else {
        console.error("응답 형식 오류:", result);
        alert("ROI 분석에 실패했습니다.");
      }
    } catch (error) {
      console.error("AI 분석 오류:", error);
      alert("ROI 분석 중 오류가 발생했습니다.");
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

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    const filename = `AI_분석_결과_ROI계산기_${timestamp}.md`;

    const blob = new Blob([aiAnalysis], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("AI 분석 결과 다운로드 완료:", filename);
  };

  // 차트 데이터 준비
  const chartData = [
    {
      name: "투자금",
      value: investment,
      fill: "#ef4444",
    },
    {
      name: "매출",
      value: revenue,
      fill: "#10b981",
    },
    {
      name: "비용",
      value: cost,
      fill: "#f59e0b",
    },
    {
      name: "순이익",
      value: netProfit,
      fill: "#3b82f6",
    },
  ].filter((item) => item.value > 0);

  const roiComparisonData = [
    {
      name: "현재 ROI",
      value: roi,
      fill: "#8b5cf6",
    },
    {
      name: "업계 평균 (예상)",
      value: 20, // 예시 값
      fill: "#94a3b8",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          ROI 계산기
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          투자 대비 수익률을 계산하여 광고 효과를 측정하세요
        </p>

        {/* AI 서비스 제공 사실 고지 */}
        <AIServiceNotice />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                상품명 또는 비즈니스 정보
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => {
                    console.log("상품명 변경:", e.target.value);
                    setProductName(e.target.value);
                  }}
                  placeholder="예: 스마트폰 케이스, 온라인 강의 등"
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleAIEstimate}
                  disabled={isLoading || !productName.trim()}
                  className="px-4 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium whitespace-nowrap shadow-sm hover:shadow text-sm sm:text-base"
                  title="AI로 ROI 정보 자동 입력"
                >
                  {isLoading ? "AI 분석 중..." : "🤖 AI 추정"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                투자금 (광고비) (원)
              </label>
              <input
                type="number"
                value={investment || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log("투자금 변경:", value);
                  setInvestment(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                매출 (원)
              </label>
              <input
                type="number"
                value={revenue || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log("매출 변경:", value);
                  setRevenue(value);
                }}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                비용 (원)
              </label>
              <input
                type="number"
                value={cost || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  console.log("비용 변경:", value);
                  setCost(value);
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

          {(investment > 0 || revenue > 0 || cost > 0) && (
            <div className="mt-8 space-y-4">
              <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <h3 className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-200 mb-2 sm:mb-3">
                  계산 결과
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      순이익:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {netProfit.toLocaleString("ko-KR")} 원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      <InfoTooltip text="투자한 광고비 대비 얼마나 이익을 냈는지 보여주는 지표예요. 100%면 광고비만큼 이익을 냈다는 뜻이에요.">
                        ROI:
                      </InfoTooltip>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {roi.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      <InfoTooltip text="광고비 1원당 벌어들인 매출액이에요. 예를 들어 ROAS가 3배면 광고비 1원에 매출 3원을 벌었다는 뜻이에요.">
                        ROAS:
                      </InfoTooltip>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {roas.toFixed(2)}배
                    </span>
                  </div>
                </div>
              </div>

              {/* AI 종합 분석 버튼 */}
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
                    <>🤖 AI 종합 분석</>
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
                      className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium flex items-center gap-2 shadow-sm hover:shadow text-sm sm:text-base"
                      title="AI 분석 결과 다운로드"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
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
                      {/* 수익 구조 막대 차트 */}
                      {chartData.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                            수익 구조 분석
                          </h4>
                          <ResponsiveContainer width="100%" height={chartHeight}>
                            <BarChart data={chartData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="currentColor"
                                opacity={0.2}
                              />
                              <XAxis
                                dataKey="name"
                                tick={{ fill: "currentColor", fontSize: chartFontSize }}
                                stroke="currentColor"
                                angle={isMobile ? -45 : 0}
                                textAnchor={isMobile ? 'end' : 'middle'}
                                height={isMobile ? 60 : 30}
                              />
                              <YAxis
                                tick={{ fill: "currentColor", fontSize: chartFontSize }}
                                stroke="currentColor"
                                tickFormatter={(value) =>
                                  `${(value / 1000).toFixed(0)}k`
                                }
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                  border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                                  borderRadius: "8px",
                                  color: isDarkMode ? '#f3f4f6' : '#111827'
                                }}
                                formatter={(value: number) =>
                                  `${value.toLocaleString("ko-KR")}원`
                                }
                              />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                  />
                                ))}
                              </Bar>
                              <Legend 
                                wrapperStyle={{ color: isDarkMode ? '#f3f4f6' : '#111827' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* ROI 비교 파이 차트 */}
                      {roi > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                            ROI 비교
                          </h4>
                          <ResponsiveContainer width="100%" height={chartHeight}>
                            <PieChart>
                              <Pie
                                data={roiComparisonData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) =>
                                  `${name}: ${value.toFixed(2)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {roiComparisonData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.fill}
                                  />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                  border: isDarkMode ? '1px solid #4b5563' : '1px solid #ccc',
                                  borderRadius: "8px",
                                  color: isDarkMode ? '#f3f4f6' : '#111827'
                                }}
                                formatter={(value: number) =>
                                  `${value.toFixed(2)}%`
                                }
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
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(aiAnalysis),
                        }}
                      />
                    </div>
                  </AIGeneratedContent>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
            계산 공식 안내
          </h2>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>순이익</strong> = 매출 - 비용
            </li>
            <li>
              <strong>
                <InfoTooltip text="투자한 광고비 대비 얼마나 이익을 냈는지 보여주는 지표예요. 100%면 광고비만큼 이익을 냈다는 뜻이에요.">
                  ROI
                </InfoTooltip>
              </strong>{" "}
              = ((순이익 - 투자금) ÷ 투자금) × 100
            </li>
            <li>
              <strong>
                <InfoTooltip text="광고비 1원당 벌어들인 매출액이에요. 예를 들어 ROAS가 3배면 광고비 1원에 매출 3원을 벌었다는 뜻이에요.">
                  ROAS
                </InfoTooltip>
              </strong>{" "}
              = 매출 ÷ 투자금
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
