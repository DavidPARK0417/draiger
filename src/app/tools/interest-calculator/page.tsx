'use client';

import { useState, useRef } from 'react';
import { InfoTooltip } from '@/components/Tooltip';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 대출 상환 방법 타입
type RepaymentMethod = 'equal_principal' | 'equal_installment' | 'bullet';

// 이자 계산법 타입
type InterestMethod = 'simple' | 'compound';

// 대출 상환 회차 정보
interface LoanScheduleItem {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

// 대출 계산 결과
interface LoanResult {
  totalPrincipal: number;
  totalInterest: number;
  totalAmount: number;
  schedule: LoanScheduleItem[];
}

// 예적금 계산 결과
interface SavingsResult {
  principal: number;
  interestBeforeTax: number;
  interestAfterTax: number;
  maturityAmount: number;
}

export default function InterestCalculatorPage() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<'loan' | 'savings'>('loan');
  const [savingsSubTab, setSavingsSubTab] = useState<'installment' | 'deposit'>('installment');

  // 대출이자 계산기 상태
  const [repaymentMethod, setRepaymentMethod] = useState<RepaymentMethod>('equal_principal');
  const [loanPrincipal, setLoanPrincipal] = useState<number>(0); // 만원 단위
  const [loanTerm, setLoanTerm] = useState<number>(0); // 개월
  const [gracePeriod, setGracePeriod] = useState<number>(0); // 개월
  const [loanRate, setLoanRate] = useState<number>(0); // 연%
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  const loanResultRef = useRef<HTMLDivElement>(null);

  // 예적금 계산기 상태
  // 적금
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(0);
  const [savingsTerm, setSavingsTerm] = useState<number>(0); // 개월
  const [savingsRate, setSavingsRate] = useState<number>(0); // %
  const [savingsInterestMethod, setSavingsInterestMethod] = useState<InterestMethod>('simple');
  // 예금
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositTerm, setDepositTerm] = useState<number>(0); // 개월
  const [depositRate, setDepositRate] = useState<number>(0); // %
  const [depositInterestMethod, setDepositInterestMethod] = useState<InterestMethod>('simple');
  
  const [savingsResult, setSavingsResult] = useState<SavingsResult | null>(null);
  const savingsResultRef = useRef<HTMLDivElement>(null);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // 대출이자 계산 함수
  const calculateLoan = () => {
    console.log('=== 대출이자 계산 시작 ===');
    console.log('상환방법:', repaymentMethod);
    console.log('대출원금:', loanPrincipal, '만원');
    console.log('대출기간:', loanTerm, '개월');
    console.log('거치기간:', gracePeriod, '개월');
    console.log('대출금리:', loanRate, '%');

    if (loanPrincipal <= 0 || loanTerm <= 0 || loanRate <= 0) {
      alert('모든 값을 올바르게 입력해주세요.');
      return;
    }

    if (gracePeriod >= loanTerm) {
      alert('거치기간은 대출기간보다 작아야 합니다.');
      return;
    }

    const principal = loanPrincipal * 10000; // 만원을 원으로 변환
    const monthlyRate = loanRate / 100 / 12; // 연이율을 월이율로 변환
    const repaymentPeriod = loanTerm - gracePeriod; // 실제 상환 기간

    let schedule: LoanScheduleItem[] = [];
    let totalInterest = 0;
    let totalPrincipalPaid = 0;

    if (repaymentMethod === 'equal_principal') {
      // 원금균등상환
      const monthlyPrincipal = principal / repaymentPeriod;
      let balance = principal;

      // 거치기간 동안 이자만 납부
      for (let i = 1; i <= gracePeriod; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        schedule.push({
          period: i,
          payment: interest,
          interest: interest,
          principal: 0,
          balance: balance,
        });
      }

      // 상환기간 동안 원금 균등 분할
      for (let i = 1; i <= repaymentPeriod; i++) {
        const interest = balance * monthlyRate;
        const payment = monthlyPrincipal + interest;
        balance -= monthlyPrincipal;
        totalInterest += interest;
        totalPrincipalPaid += monthlyPrincipal;

        schedule.push({
          period: gracePeriod + i,
          payment: payment,
          interest: interest,
          principal: monthlyPrincipal,
          balance: Math.max(0, balance),
        });
      }
    } else if (repaymentMethod === 'equal_installment') {
      // 원리금균등상환
      let balance = principal;

      // 거치기간 동안 이자만 납부
      for (let i = 1; i <= gracePeriod; i++) {
        const interest = balance * monthlyRate;
        totalInterest += interest;
        schedule.push({
          period: i,
          payment: interest,
          interest: interest,
          principal: 0,
          balance: balance,
        });
      }

      // 상환기간 동안 원리금 균등 분할 (PMT 공식 사용)
      if (repaymentPeriod > 0 && monthlyRate > 0) {
        const monthlyPayment =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, repaymentPeriod)) /
          (Math.pow(1 + monthlyRate, repaymentPeriod) - 1);

        for (let i = 1; i <= repaymentPeriod; i++) {
          const interest = balance * monthlyRate;
          const principalPaid = monthlyPayment - interest;
          balance -= principalPaid;
          totalInterest += interest;
          totalPrincipalPaid += principalPaid;

          schedule.push({
            period: gracePeriod + i,
            payment: monthlyPayment,
            interest: interest,
            principal: principalPaid,
            balance: Math.max(0, balance),
          });
        }
      }
    } else if (repaymentMethod === 'bullet') {
      // 만기일시상환
      for (let i = 1; i <= loanTerm; i++) {
        const interest = principal * monthlyRate;
        totalInterest += interest;
        schedule.push({
          period: i,
          payment: interest,
          interest: interest,
          principal: i === loanTerm ? principal : 0,
          balance: i === loanTerm ? 0 : principal,
        });
      }
      totalPrincipalPaid = principal;
    }

    const result: LoanResult = {
      totalPrincipal: totalPrincipalPaid,
      totalInterest: totalInterest,
      totalAmount: totalPrincipalPaid + totalInterest,
      schedule: schedule,
    };

    console.log('=== 대출이자 계산 완료 ===');
    console.log('총 납입원금:', result.totalPrincipal);
    console.log('총 이자:', result.totalInterest);
    console.log('원금 및 총 이자액 합계:', result.totalAmount);
    console.log('회차별 상환표:', result.schedule);

    setLoanResult(result);
    setCurrentPage(1);
  };

  // 예적금 계산 함수
  const calculateSavings = () => {
    console.log('=== 예적금 계산 시작 ===');

    if (savingsSubTab === 'installment') {
      // 적금 계산
      if (monthlyDeposit <= 0 || savingsTerm <= 0 || savingsRate <= 0) {
        alert('모든 값을 올바르게 입력해주세요.');
        return;
      }

      console.log('적금 - 월저축액:', monthlyDeposit);
      console.log('적금 - 적립기간:', savingsTerm, '개월');
      console.log('적금 - 이자율:', savingsRate, '%');
      console.log('적금 - 이자계산법:', savingsInterestMethod);

      const monthlyRate = savingsRate / 100 / 12;
      let interestBeforeTax = 0;
      const totalPrincipal = monthlyDeposit * savingsTerm;

      if (savingsInterestMethod === 'simple') {
        // 단리 계산: 각 월별 저축액에 대해 남은 기간만큼 이자 계산
        // 첫 달 저축액은 savingsTerm개월 동안, 두 번째 달은 savingsTerm-1개월 동안...
        for (let i = 1; i <= savingsTerm; i++) {
          const remainingMonths = savingsTerm - i + 1;
          interestBeforeTax += monthlyDeposit * monthlyRate * remainingMonths;
        }
      } else {
        // 월복리 계산: 매월 저축액을 넣고 이자가 붙는 방식
        let balance = 0;
        for (let i = 1; i <= savingsTerm; i++) {
          balance = (balance + monthlyDeposit) * (1 + monthlyRate);
        }
        interestBeforeTax = balance - totalPrincipal;
      }

      const tax = interestBeforeTax * 0.154; // 15.4% 원천징수
      const interestAfterTax = interestBeforeTax - tax;
      const maturityAmount = totalPrincipal + interestAfterTax;

      const result: SavingsResult = {
        principal: totalPrincipal,
        interestBeforeTax: interestBeforeTax,
        interestAfterTax: interestAfterTax,
        maturityAmount: maturityAmount,
      };

      console.log('=== 적금 계산 완료 ===');
      console.log('원금합계:', result.principal);
      console.log('이자(세전):', result.interestBeforeTax);
      console.log('이자(세후):', result.interestAfterTax);
      console.log('만기지급액:', result.maturityAmount);

      setSavingsResult(result);
    } else {
      // 예금 계산
      if (depositAmount <= 0 || depositTerm <= 0 || depositRate <= 0) {
        alert('모든 값을 올바르게 입력해주세요.');
        return;
      }

      console.log('예금 - 예치금액:', depositAmount);
      console.log('예금 - 예치기간:', depositTerm, '개월');
      console.log('예금 - 이자율:', depositRate, '%');
      console.log('예금 - 이자계산법:', depositInterestMethod);

      let interestBeforeTax = 0;

      if (depositInterestMethod === 'simple') {
        // 단리 계산
        interestBeforeTax = (depositAmount * depositRate * depositTerm) / 100 / 12;
      } else {
        // 월복리 계산
        const monthlyRate = depositRate / 100 / 12;
        interestBeforeTax = depositAmount * (Math.pow(1 + monthlyRate, depositTerm) - 1);
      }

      const tax = interestBeforeTax * 0.154; // 15.4% 원천징수
      const interestAfterTax = interestBeforeTax - tax;
      const maturityAmount = depositAmount + interestAfterTax;

      const result: SavingsResult = {
        principal: depositAmount,
        interestBeforeTax: interestBeforeTax,
        interestAfterTax: interestAfterTax,
        maturityAmount: maturityAmount,
      };

      console.log('=== 예금 계산 완료 ===');
      console.log('원금합계:', result.principal);
      console.log('이자(세전):', result.interestBeforeTax);
      console.log('이자(세후):', result.interestAfterTax);
      console.log('만기지급액:', result.maturityAmount);

      setSavingsResult(result);
    }
  };

  // PDF 다운로드 함수 (대출이자 계산기)
  const downloadLoanPDF = async () => {
    if (!loanResult) return;

    try {
      console.log('=== 대출이자 계산기 PDF 다운로드 시작 ===');
      
      // PDF용 임시 div 생성 (모든 회차 포함)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Pretendard, sans-serif';
      
      tempDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">대출이자 계산 결과</h2>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>총 납입원금:</span>
              <span style="font-weight: bold;">${loanResult.totalPrincipal.toLocaleString('ko-KR')} 원</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>총 이자:</span>
              <span style="font-weight: bold;">${loanResult.totalInterest.toLocaleString('ko-KR')} 원</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>원금 및 총 이자액 합계:</span>
              <span style="font-weight: bold;">${loanResult.totalAmount.toLocaleString('ko-KR')} 원</span>
            </div>
          </div>
        </div>
        <div>
          <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">회차별 대출 상환 표</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">회차</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">납입금액 (원)</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">이자</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">상환금 (원)</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">잔금 (원)</th>
              </tr>
            </thead>
            <tbody>
              ${loanResult.schedule.map(item => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${item.period}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${item.payment.toLocaleString('ko-KR')}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${item.interest.toLocaleString('ko-KR')}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${item.principal.toLocaleString('ko-KR')}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${item.balance.toLocaleString('ko-KR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      document.body.removeChild(tempDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const filename = `대출이자계산기_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      console.log('=== 대출이자 계산기 PDF 다운로드 완료 ===');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  // PDF 다운로드 함수 (예적금 계산기)
  const downloadSavingsPDF = async () => {
    if (!savingsResult || !savingsResultRef.current) return;

    try {
      console.log('=== 예적금 계산기 PDF 다운로드 시작 ===');
      const canvas = await html2canvas(savingsResultRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const filename = `예적금계산기_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      console.log('=== 예적금 계산기 PDF 다운로드 완료 ===');
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 페이지네이션 계산
  const totalPages = loanResult
    ? Math.ceil(loanResult.schedule.length / itemsPerPage)
    : 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedule = loanResult
    ? loanResult.schedule.slice(startIndex, endIndex)
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          이자 계산기
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          대출이자와 예적금 예상 수령액을 쉽게 계산하세요
        </p>

        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-4 py-2.5 font-medium rounded-t-xl transition-all duration-300 ${
              activeTab === 'loan'
                ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            대출이자 계산기
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-2.5 font-medium rounded-t-xl transition-all duration-300 ${
              activeTab === 'savings'
                ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            예적금 예상 수령액 계산기
          </button>
        </div>

        {/* 대출이자 계산기 */}
        {activeTab === 'loan' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-6 sm:p-8 lg:p-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  상환방법
                </label>
                <select
                  value={repaymentMethod}
                  onChange={(e) =>
                    setRepaymentMethod(e.target.value as RepaymentMethod)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                >
                  <option value="equal_principal">원금균등상환</option>
                  <option value="equal_installment">원리금균등상환</option>
                  <option value="bullet">만기일시상환</option>
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {repaymentMethod === 'equal_principal' &&
                    '거치기간동안은 대출원금에 대한 이자만 납부하고, 잔여 대출기간에는 매월 동일한 원금을 납부하되 이자는 매달 원금이 공제된 잔금에 대하여 납부하는 방식입니다.'}
                  {repaymentMethod === 'equal_installment' &&
                    '거치기간동안은 원금에 대한 이자만을 납부하고, 잔여 대출기간에는 매월 약정된 원금과 이자가 정액으로 나가는 방식입니다.'}
                  {repaymentMethod === 'bullet' &&
                    '대출만기까지 대출원금에 대한 이자만 납부하고, 원금은 만기에 지불하는 방식입니다.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  대출원금 (만원)
                </label>
                <input
                  type="number"
                  value={loanPrincipal || ''}
                  onChange={(e) => setLoanPrincipal(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  대출기간 (개월)
                </label>
                <input
                  type="number"
                  value={loanTerm || ''}
                  onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  거치기간 (개월)
                </label>
                <input
                  type="number"
                  value={gracePeriod || ''}
                  onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  대출금리 (% 연)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={loanRate || ''}
                  onChange={(e) => setLoanRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                />
              </div>

              <button
                onClick={calculateLoan}
                className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                계산하기
              </button>
            </div>

            {/* 계산 결과 */}
            {loanResult && (
              <div className="mt-8 space-y-6" ref={loanResultRef}>
                {/* 요약 결과 */}
                <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-md">
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-200 mb-2 sm:mb-3">
                    계산 결과
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        총 납입원금:
                      </span>
                      <span className="font-semibold text-foreground">
                        {loanResult.totalPrincipal.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        총 이자:
                      </span>
                      <span className="font-semibold text-foreground">
                        {loanResult.totalInterest.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        원금 및 총 이자액 합계:
                      </span>
                      <span className="font-semibold text-foreground">
                        {loanResult.totalAmount.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                  </div>
                </div>

                {/* PDF 다운로드 버튼 */}
                <div className="flex justify-end">
                  <button
                    onClick={downloadLoanPDF}
                    className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
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
                    PDF 다운로드
                  </button>
                </div>

                {/* 회차별 상환표 */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
                  <h3 className="text-lg font-semibold p-4 text-foreground">
                    회차별 대출 상환 표
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            회차
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            납입금액 (원)
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            이자
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            상환금 (원)
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            잔금 (원)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentSchedule.map((item) => (
                          <tr
                            key={item.period}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-4 py-3 text-foreground">
                              {item.period}
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {item.payment.toLocaleString('ko-KR')}
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {item.interest.toLocaleString('ko-KR')}
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {item.principal.toLocaleString('ko-KR')}
                            </td>
                            <td className="px-4 py-3 text-foreground">
                              {item.balance.toLocaleString('ko-KR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        이전
                      </button>
                      <span className="text-sm text-foreground">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 예적금 예상 수령액 계산기 */}
        {activeTab === 'savings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-6 sm:p-8 lg:p-10">
            {/* 서브탭 */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSavingsSubTab('installment')}
                className={`px-4 py-2.5 font-medium rounded-t-xl transition-all duration-300 ${
                  savingsSubTab === 'installment'
                    ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                적금
              </button>
              <button
                onClick={() => setSavingsSubTab('deposit')}
                className={`px-4 py-2.5 font-medium rounded-t-xl transition-all duration-300 ${
                  savingsSubTab === 'deposit'
                    ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                예금
              </button>
            </div>

            <div className="space-y-6">
              {savingsSubTab === 'installment' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      월저축액 (원)
                    </label>
                    <input
                      type="number"
                      value={monthlyDeposit || ''}
                      onChange={(e) =>
                        setMonthlyDeposit(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      적립기간 (개월)
                    </label>
                    <input
                      type="number"
                      value={savingsTerm || ''}
                      onChange={(e) =>
                        setSavingsTerm(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      이자율 (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={savingsRate || ''}
                      onChange={(e) =>
                        setSavingsRate(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      이자계산법
                    </label>
                    <select
                      value={savingsInterestMethod}
                      onChange={(e) =>
                        setSavingsInterestMethod(e.target.value as InterestMethod)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    >
                      <option value="simple">단리</option>
                      <option value="compound">월복리</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      예치금액 (원)
                    </label>
                    <input
                      type="number"
                      value={depositAmount || ''}
                      onChange={(e) =>
                        setDepositAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      예치기간 (개월)
                    </label>
                    <input
                      type="number"
                      value={depositTerm || ''}
                      onChange={(e) =>
                        setDepositTerm(parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      이자율 (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={depositRate || ''}
                      onChange={(e) =>
                        setDepositRate(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      이자계산법
                    </label>
                    <select
                      value={depositInterestMethod}
                      onChange={(e) =>
                        setDepositInterestMethod(e.target.value as InterestMethod)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-foreground"
                    >
                      <option value="simple">단리</option>
                      <option value="compound">월복리</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={calculateSavings}
                className="w-full px-6 py-3 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                계산하기
              </button>
            </div>

            {/* 계산 결과 */}
            {savingsResult && (
              <div className="mt-8 space-y-6" ref={savingsResultRef}>
                <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-md">
                  <h3 className="text-sm sm:text-base font-semibold text-emerald-800 dark:text-emerald-200 mb-2 sm:mb-3">
                    계산 결과
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        원금합계 (원):
                      </span>
                      <span className="font-semibold text-foreground">
                        {savingsResult.principal.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        이자 (세전, 원):
                      </span>
                      <span className="font-semibold text-foreground">
                        {savingsResult.interestBeforeTax.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        이자 (세후, 원):
                      </span>
                      <span className="font-semibold text-foreground">
                        {savingsResult.interestAfterTax.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        만기지급액:
                      </span>
                      <span className="font-semibold text-foreground">
                        {savingsResult.maturityAmount.toLocaleString('ko-KR')} 원
                      </span>
                    </div>
                  </div>
                </div>

                {/* PDF 다운로드 버튼 */}
                <div className="flex justify-end">
                  <button
                    onClick={downloadSavingsPDF}
                    className="px-4 py-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-300 font-medium flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
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
                    PDF 다운로드
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 안내 문구 */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-gray-900/50 p-4 sm:p-6 lg:p-8">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            ※ 상품 특성에 따라 상환(이자)금액 및 일정 등은 달라질 수 있는 참고
            자료로 정확한 정보를 원하시면 영업점 방문 또는 고객상담센터로
            문의하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}

