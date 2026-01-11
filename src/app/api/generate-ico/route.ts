import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

/**
 * 고품질 ICO 파일 생성 API
 * Pillow를 사용하여 멀티 사이즈(16x16, 32x32, 48x48) ICO 파일을 생성합니다.
 * PNG-in-ICO와 BMP 기반 ICO 구조를 모두 지원합니다.
 */
export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    console.log("🎨 [ICO 생성 API] 고품질 ICO 생성 요청 수신");

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      console.error("❌ [ICO 생성 API] 파일 없음");
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기가 너무 큽니다. 최대 10MB까지 지원됩니다." },
        { status: 400 }
      );
    }

    // 임시 파일 경로 생성
    const tempDir = tmpdir();
    const timestamp = Date.now();
    tempInputPath = join(tempDir, `ico_input_${timestamp}.${imageFile.name.split('.').pop() || 'png'}`);
    tempOutputPath = join(tempDir, `ico_output_${timestamp}.ico`);

    // 파일을 임시 디렉토리에 저장
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempInputPath, buffer);

    console.log("📄 [ICO 생성 API] 임시 파일 저장 완료", { tempInputPath });

    // Python 스크립트 실행
    const pythonScript = join(process.cwd(), "scripts", "generate_ico.py");
    
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
          // Python이 없으면 클라이언트 사이드 생성 결과를 사용하도록 안내
          console.warn("⚠️ [ICO 생성 API] Python이 설치되지 않음, 클라이언트 사이드 생성 사용");
          return NextResponse.json(
            {
              error:
                "서버 사이드 고품질 ICO 생성을 사용하려면 Python과 Pillow가 필요합니다. " +
                "현재는 클라이언트 사이드 생성 결과를 사용합니다.",
              requiresPython: true,
            },
            { status: 503 } // Service Unavailable
          );
        }
      }
    }
    
    const command = `${pythonCommand} "${pythonScript}" "${tempInputPath}" "${tempOutputPath}"`;

    console.log("🐍 [ICO 생성 API] Python 스크립트 실행", { command });

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30초 타임아웃
    });

    if (stderr) {
      console.log("ℹ️ [ICO 생성 API] Python 스크립트 출력:", stderr);
    }

    // 생성된 ICO 파일 확인
    const { readFile, access } = await import("fs/promises");
    try {
      await access(tempOutputPath);
    } catch {
      throw new Error("ICO 변환 파일을 생성할 수 없습니다.");
    }

    const icoBuffer = await readFile(tempOutputPath);

    console.log("✅ [ICO 생성 API] ICO 생성 완료", {
      icoSize: icoBuffer.length,
    });

    // 임시 파일 삭제
    await unlink(tempInputPath);
    await unlink(tempOutputPath);
    tempInputPath = null;
    tempOutputPath = null;

    // ICO 파일 반환
    return new NextResponse(icoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/x-icon",
        "Content-Disposition": `attachment; filename="favicon.ico"`,
      },
    });
  } catch (error) {
    console.error("❌ [ICO 생성 API] 오류:", error);
    
    // 임시 파일 정리
    if (tempInputPath) {
      try {
        await unlink(tempInputPath);
      } catch {
        // 무시
      }
    }
    if (tempOutputPath) {
      try {
        await unlink(tempOutputPath);
      } catch {
        // 무시
      }
    }

    return NextResponse.json(
      { 
        error: "ICO 생성 중 오류가 발생했습니다.",
        message: error instanceof Error ? error.message : "알 수 없는 오류"
      },
      { status: 500 }
    );
  }
}

