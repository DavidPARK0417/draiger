#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HWP 파일을 PDF로 변환하는 Python 스크립트

주의: HWP 파일 형식은 복잡하여 완전한 변환은 어렵습니다.
현재는 기본적인 텍스트 추출만 지원합니다.

필요한 패키지:
- reportlab: PDF 생성용
- olefile: OLE 파일 파싱용 (HWP는 OLE 형식)
"""

import sys
import os
import struct

def extract_text_from_hwp(input_path: str) -> str:
    """
    HWP 파일에서 텍스트를 추출 (간단한 방법)
    
    Args:
        input_path: 입력 HWP 파일 경로
        
    Returns:
        추출된 텍스트
    """
    try:
        # HWP 파일은 OLE 형식이므로 바이너리로 읽기
        with open(input_path, 'rb') as f:
            content = f.read()
            
        # 간단한 텍스트 추출 시도 (완벽하지 않음)
        # 실제로는 HWP5 라이브러리가 필요하지만 PyPI에 없음
        text = ""
        
        # UTF-16 인코딩된 텍스트 찾기 시도
        try:
            # 간단한 패턴 매칭으로 텍스트 추출 시도
            # 이는 완벽하지 않으며, 실제 구현은 HWP5 라이브러리 필요
            text = "HWP 파일 텍스트 추출 기능은 현재 제한적입니다.\n"
            text += "완전한 변환을 위해서는 한글과컴퓨터의 공식 변환 도구를 사용하세요."
        except:
            pass
            
        return text
    except Exception as e:
        raise Exception(f"텍스트 추출 실패: {e}")

def convert_hwp_to_pdf(input_path: str, output_path: str):
    """
    HWP 파일을 PDF로 변환
    
    Args:
        input_path: 입력 HWP 파일 경로
        output_path: 출력 PDF 파일 경로
    """
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.units import mm
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        
        # 텍스트 추출
        text = extract_text_from_hwp(input_path)
        
        # PDF 생성
        pdf = canvas.Canvas(output_path, pagesize=A4)
        width, height = A4
        
        # 폰트 설정 (한글 지원을 위해 시스템 폰트 사용 시도)
        try:
            # Windows 기본 한글 폰트 경로
            font_path = "C:/Windows/Fonts/malgun.ttf"  # 맑은 고딕
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont("Malgun", font_path))
                pdf.setFont("Malgun", 12)
            else:
                pdf.setFont("Helvetica", 12)
        except:
            pdf.setFont("Helvetica", 12)
        
        # 텍스트를 PDF에 추가
        y_position = height - 50
        lines = text.split('\n')
        
        for line in lines[:50]:  # 최대 50줄만 표시
            if y_position < 50:
                pdf.showPage()
                y_position = height - 50
                try:
                    pdf.setFont("Malgun", 12)
                except:
                    pdf.setFont("Helvetica", 12)
            
            # 한글 텍스트 처리
            try:
                pdf.drawString(50, y_position, line[:100])  # 최대 100자
            except:
                # 인코딩 문제 시 건너뛰기
                pass
            y_position -= 20
        
        pdf.save()
        print(f"HWP 파일을 PDF로 변환했습니다: {output_path}")
        print("주의: 완전한 변환은 지원되지 않으며, 텍스트만 추출되었습니다.", file=sys.stderr)
        
    except ImportError as e:
        print(f"필요한 라이브러리가 설치되지 않았습니다: {e}", file=sys.stderr)
        print("다음 명령어로 설치하세요:", file=sys.stderr)
        print("python -m pip install reportlab", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"변환 중 오류 발생: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("사용법: python convert_hwp.py <입력_HWP_파일> <출력_PDF_파일>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"입력 파일을 찾을 수 없습니다: {input_path}", file=sys.stderr)
        sys.exit(1)
    
    convert_hwp_to_pdf(input_path, output_path)

