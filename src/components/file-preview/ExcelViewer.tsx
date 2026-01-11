"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { Loader2 } from "lucide-react";

interface ExcelViewerProps {
  file: File;
}

type CellValue = string | number | boolean | Date | null;

// 셀 값을 React에서 렌더링 가능한 문자열로 변환
function formatCellValue(value: CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (value instanceof Date) {
    return value.toLocaleString("ko-KR");
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  return String(value);
}

export default function ExcelViewer({ file }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<{ name: string; data: CellValue[][] }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("파일 읽는 중...");
  const [visibleRows, setVisibleRows] = useState<number>(100); // 초기 렌더링 행 수
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const parseExcel = async () => {
      // 이전 작업 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        setProgress(0);
        setVisibleRows(100);

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf("."));
        
        console.log("📊 [Excel 뷰어] 파싱 시작", { 
          fileName: file.name, 
          fileSize: file.size,
          fileExtension,
          mimeType: file.type,
        });

        setProgressMessage("파일 읽는 중...");
        setProgress(10);

        const arrayBuffer = await file.arrayBuffer();
        
        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("Excel 파일 파싱 중...");
        setProgress(20);

        // CSV 파일의 경우 텍스트로 읽어서 파싱
        const isCsv = fileExtension === ".csv";
        const readOptions: XLSX.ParsingOptions = {
          cellDates: true,
          cellNF: false,
          cellStyles: false,
        };

        // requestIdleCallback을 사용하여 파싱 작업을 분산
        const workbook = await new Promise<XLSX.WorkBook>((resolve, reject) => {
          const parse = () => {
            try {
              let wb: XLSX.WorkBook;
              
              if (isCsv) {
                // CSV는 문자열로 읽어서 파싱
                const text = new TextDecoder("utf-8").decode(arrayBuffer);
                wb = XLSX.read(text, { ...readOptions, type: "string" });
              } else {
                // Excel 파일은 바이너리로 파싱
                wb = XLSX.read(arrayBuffer, { ...readOptions, type: "array" });
              }
              
              console.log("✅ [Excel 뷰어] 파일 파싱 성공", {
                sheetCount: wb.SheetNames.length,
                sheetNames: wb.SheetNames,
              });
              
              resolve(wb);
            } catch (err) {
              console.error("❌ [Excel 뷰어] 파싱 오류:", err);
              reject(err);
            }
          };

          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(parse, { timeout: 1000 });
          } else {
            // 폴백: 즉시 실행
            parse();
          }
        });

        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage(`시트 파싱 중... (${workbook.SheetNames.length}개 시트)`);
        setProgress(30);

        const parsedSheets: { name: string; data: CellValue[][] }[] = [];
        const totalSheets = workbook.SheetNames.length;

        // 각 시트를 순차적으로 처리 (청크 단위)
        for (let i = 0; i < workbook.SheetNames.length; i++) {
          if (abortControllerRef.current?.signal.aborted) return;

          const name = workbook.SheetNames[i];
          const worksheet = workbook.Sheets[name];
          
          // 시트 범위 확인
          const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : null;
          const totalRows = range ? range.e.r + 1 : 0;
          const totalCols = range ? range.e.c + 1 : 0;

          setProgressMessage(`시트 "${name}" 처리 중... (${totalRows}행, ${totalCols}열)`);
          setProgress(30 + (i / totalSheets) * 50);

          // 시트 데이터를 JSON으로 변환
          const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            raw: false,
          }) as CellValue[][];

          parsedSheets.push({ name, data });

          setProgress(30 + ((i + 1) / totalSheets) * 50);
        }

        if (abortControllerRef.current?.signal.aborted) return;

        setProgressMessage("완료!");
        setProgress(100);

        // 약간의 지연 후 상태 업데이트 (UI 반응성 향상)
        await new Promise(resolve => setTimeout(resolve, 100));

        setSheets(parsedSheets);
        setIsLoading(false);

        console.log("✅ [Excel 뷰어] 파싱 완료", {
          sheetCount: parsedSheets.length,
          totalRows: parsedSheets.reduce((sum, sheet) => sum + sheet.data.length, 0),
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log("📊 [Excel 뷰어] 파싱 취소됨");
          return;
        }
        console.error("❌ [Excel 뷰어] 오류:", err);
        setError(err instanceof Error ? err.message : "Excel 파일을 파싱하는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    parseExcel();

    // 클린업
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [file]);

  const currentSheet = sheets[activeSheet];
  const displayRows = currentSheet 
    ? currentSheet.data.slice(0, Math.min(visibleRows, currentSheet.data.length))
    : [];

  // 가상 스크롤링: 스크롤 시 더 많은 행 표시
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    
    // 하단 200px 이내에 도달하면 더 많은 행 표시
    if (scrollBottom < 200 && currentSheet && visibleRows < currentSheet.data.length) {
      setVisibleRows(prev => Math.min(prev + 100, currentSheet.data.length));
    }
  }, [visibleRows, currentSheet]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center w-full max-w-md">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{progressMessage}</p>
          
          {/* 진행률 바 */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">시트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 시트 선택 탭 */}
      {sheets.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => setActiveSheet(index)}
              className={`
                px-4 py-2
                rounded-lg
                whitespace-nowrap
                transition-colors
                text-sm
                ${
                  activeSheet === index
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                }
              `}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}

      {/* 테이블 */}
      <div 
        className="overflow-x-auto max-h-[70vh] overflow-y-auto"
        onScroll={handleScroll}
      >
        <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <tbody>
            {displayRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`
                      border border-gray-200 dark:border-gray-700
                      px-3 py-2
                      text-sm
                      ${
                        rowIndex === 0
                          ? "bg-gray-100 dark:bg-gray-700 font-semibold sticky top-0 z-10"
                          : "bg-white dark:bg-gray-800"
                      }
                      text-gray-900 dark:text-gray-100
                    `}
                  >
                    {formatCellValue(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* 더 많은 데이터가 있을 때 표시 */}
        {currentSheet && visibleRows < currentSheet.data.length && (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            {visibleRows.toLocaleString()} / {currentSheet.data.length.toLocaleString()}행 표시 중...
            <br />
            <span className="text-xs">스크롤하면 더 많은 데이터를 볼 수 있습니다.</span>
          </div>
        )}
        
        {/* 전체 데이터 표시 완료 */}
        {currentSheet && visibleRows >= currentSheet.data.length && (
          <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            전체 {currentSheet.data.length.toLocaleString()}행 표시 완료
          </div>
        )}
      </div>
    </div>
  );
}

