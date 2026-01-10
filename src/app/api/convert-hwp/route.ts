import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  // 하이브리드 접근: 클라이언트 사이드 파싱 실패 시 서버 사이드 변환 시도
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    console.log("🔄 [HWP 변환 API] 서버 사이드 변환 요청 수신");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("❌ [HWP 변환 API] 파일 없음");
      return NextResponse.json(
        { error: "HWP 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기가 너무 큽니다. 최대 10MB까지 지원됩니다." },
        { status: 400 }
      );
    }

    // 임시 파일 경로 생성
    const tempDir = tmpdir();
    const timestamp = Date.now();
    tempInputPath = join(tempDir, `hwp_input_${timestamp}.hwp`);
    tempOutputPath = join(tempDir, `hwp_output_${timestamp}.pdf`);

    // 파일을 임시 디렉토리에 저장
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempInputPath, buffer);

    console.log("📄 [HWP 변환 API] 임시 파일 저장 완료", { tempInputPath });

    // Python 스크립트 실행
    const pythonScript = join(process.cwd(), "scripts", "convert_hwp.py");
    
    // Python 명령어 확인 (python, python3, py 순서로 시도)
    let pythonCommand = "python";
    try {
      await execAsync("python --version");
    } catch {
      try {
        await execAsync("python3 --version");
        pythonCommand = "python3";
      } catch {
        try {
          await execAsync("py --version");
          pythonCommand = "py";
        } catch {
          // Python이 없으면 클라이언트 사이드 파싱 결과를 사용하도록 안내
          return NextResponse.json(
            {
              error:
                "서버 사이드 변환을 사용하려면 Python이 필요합니다. " +
                "현재는 클라이언트 사이드 파싱 결과만 사용할 수 있습니다.",
              requiresPython: true,
            },
            { status: 503 } // Service Unavailable
          );
        }
      }
    }
    
    const command = `${pythonCommand} "${pythonScript}" "${tempInputPath}" "${tempOutputPath}"`;

    console.log("🐍 [HWP 변환 API] Python 스크립트 실행", { command });

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30초 타임아웃
    });

    if (stderr && !stderr.includes("완전한 변환은 지원되지 않으며")) {
      console.warn("⚠️ [HWP 변환 API] Python 스크립트 경고:", stderr);
    }

    // 변환된 PDF 파일 확인
    const { readFile, access } = await import("fs/promises");
    try {
      await access(tempOutputPath);
    } catch {
      throw new Error("PDF 변환 파일을 생성할 수 없습니다.");
    }

    const pdfBuffer = await readFile(tempOutputPath);

    console.log("✅ [HWP 변환 API] 변환 완료", {
      pdfSize: pdfBuffer.length,
      stdout: stdout.substring(0, 100),
    });

    // 임시 파일 삭제
    await unlink(tempInputPath);
    await unlink(tempOutputPath);
    tempInputPath = null;
    tempOutputPath = null;

    // PDF 반환
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="converted.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ [HWP 변환 API] 오류:", error);

    // 임시 파일 정리
    if (tempInputPath) {
      try {
        await unlink(tempInputPath);
      } catch (e) {
        console.error("임시 입력 파일 삭제 실패:", e);
      }
    }
    if (tempOutputPath) {
      try {
        await unlink(tempOutputPath);
      } catch (e) {
        console.error("임시 출력 파일 삭제 실패:", e);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "HWP 변환 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }

  /* 기존 주석 처리된 코드는 아래에 유지
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    console.log("🔄 [HWP 변환 API] 요청 수신");

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("❌ [HWP 변환 API] 파일 없음");
      return NextResponse.json(
        { error: "HWP 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 임시 파일 경로 생성
    const tempDir = tmpdir();
    const timestamp = Date.now();
    tempInputPath = join(tempDir, `hwp_input_${timestamp}.hwp`);
    tempOutputPath = join(tempDir, `hwp_output_${timestamp}.pdf`);

    // 파일을 임시 디렉토리에 저장
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempInputPath, buffer);

    console.log("📄 [HWP 변환 API] 임시 파일 저장 완료", { tempInputPath });

    // Python 스크립트 실행
    // pyhwp 또는 hwp5 라이브러리 사용
    const pythonScript = join(process.cwd(), "scripts", "convert_hwp.py");
    
    // Python 명령어 확인 (python, python3, py 순서로 시도)
    let pythonCommand = "python";
    try {
      await execAsync("python --version");
    } catch {
      try {
        await execAsync("python3 --version");
        pythonCommand = "python3";
      } catch {
        try {
          await execAsync("py --version");
          pythonCommand = "py";
        } catch {
          throw new Error(
            "Python이 설치되어 있지 않습니다. HWP 변환을 사용하려면 Python 3.8 이상을 설치하고 'pip install hwp5 reportlab' 명령어로 필요한 패키지를 설치해주세요."
          );
        }
      }
    }
    
    const command = `${pythonCommand} "${pythonScript}" "${tempInputPath}" "${tempOutputPath}"`;

    console.log("🐍 [HWP 변환 API] Python 스크립트 실행", { command });

    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn("⚠️ [HWP 변환 API] Python 스크립트 경고:", stderr);
    }

    console.log("✅ [HWP 변환 API] 변환 완료", { stdout });

    // 변환된 PDF 파일 읽기
    const { readFile } = await import("fs/promises");
    const pdfBuffer = await readFile(tempOutputPath);

    // 임시 파일 삭제
    await unlink(tempInputPath);
    await unlink(tempOutputPath);
    tempInputPath = null;
    tempOutputPath = null;

    // PDF 반환
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="converted.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ [HWP 변환 API] 오류:", error);

    // 임시 파일 정리
    if (tempInputPath) {
      try {
        await unlink(tempInputPath);
      } catch (e) {
        console.error("임시 입력 파일 삭제 실패:", e);
      }
    }
    if (tempOutputPath) {
      try {
        await unlink(tempOutputPath);
      } catch (e) {
        console.error("임시 출력 파일 삭제 실패:", e);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "HWP 변환 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
  */
}

