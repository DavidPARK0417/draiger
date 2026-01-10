#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
HWP 파일을 PDF로 변환하는 Python 스크립트

필요한 패키지:
- reportlab: PDF 생성용
- olefile: OLE 파일 파싱용 (HWP는 OLE 형식)
- pyhwp: HWP 파일 파싱용
"""

import sys
import os
import struct
import re

def extract_text_with_olefile(input_path: str) -> str:
    """
    olefile을 사용하여 HWP 파일에서 텍스트 추출 (개선된 버전)
    
    Args:
        input_path: 입력 HWP 파일 경로
        
    Returns:
        추출된 텍스트
    """
    try:
        import olefile
        
        if not olefile.isOleFile(input_path):
            print("HWP 파일이 올바른 OLE 형식이 아닙니다.", file=sys.stderr)
            return ""
        
        text_parts = []
        ole = olefile.OleFileIO(input_path)
        
        # PrvText 스트림에서 미리보기 텍스트 추출 (가장 정확)
        if ole.exists('PrvText'):
            try:
                stream = ole.openstream('PrvText')
                data = stream.read()
                
                # UTF-16 LE로 디코딩 (HWP 파일의 기본 인코딩)
                try:
                    text = data.decode('utf-16-le', errors='ignore')
                    # 깨진 문자와 제어 문자 제거
                    filtered = ''.join(
                        c for c in text 
                        if (c.isprintable() or c.isspace()) 
                        and ord(c) < 0x10000  # 유니코드 기본 평면만
                        and c != '\uFFFD'  # 대체 문자 제거
                    )
                    # 연속된 공백 정리
                    filtered = re.sub(r'\s+', ' ', filtered).strip()
                    
                    # 의미 있는 텍스트인지 확인
                    if filtered and len(filtered) > 10:
                        # 한글 또는 영문이 포함되어야 함
                        if re.search(r'[가-힣a-zA-Z]{3,}', filtered):
                            text_parts.append(filtered)
                            print(f"PrvText에서 {len(filtered)} 문자 추출", file=sys.stderr)
                except Exception as e:
                    print(f"PrvText UTF-16 디코딩 실패: {e}", file=sys.stderr)
            except Exception as e:
                print(f"PrvText 스트림 읽기 실패: {e}", file=sys.stderr)
        
        # BodyText 스트림은 복잡한 구조라서 기본적인 추출만 시도
        # (실제로는 HWP5 파서가 필요)
        if ole.exists('BodyText') and not text_parts:
            try:
                stream = ole.openstream('BodyText')
                data = stream.read()
                
                # UTF-16 LE로 디코딩 시도
                try:
                    text = data.decode('utf-16-le', errors='ignore')
                    # 읽을 수 있는 텍스트만 추출
                    readable = ''.join(
                        c for c in text 
                        if (c.isprintable() or c.isspace()) 
                        and ord(c) < 0x10000
                        and c != '\uFFFD'
                    )
                    readable = re.sub(r'\s+', ' ', readable).strip()
                    
                    # 의미 있는 텍스트 확인
                    if readable and len(readable) > 20:
                        if re.search(r'[가-힣a-zA-Z]{3,}', readable):
                            text_parts.append(readable)
                            print(f"BodyText에서 {len(readable)} 문자 추출", file=sys.stderr)
                except:
                    pass
            except Exception as e:
                print(f"BodyText 스트림 읽기 실패: {e}", file=sys.stderr)
        
        ole.close()
        
        if text_parts:
            combined = '\n\n'.join(text_parts)
            # 최종 정리: 중복 제거 및 품질 검사
            lines = combined.split('\n')
            unique_lines = []
            seen = set()
            
            for line in lines:
                line = line.strip()
                if line and len(line) > 5:
                    # 유사한 줄 제거
                    line_key = line[:50] if len(line) > 50 else line
                    if line_key not in seen:
                        seen.add(line_key)
                        unique_lines.append(line)
            
            result = '\n'.join(unique_lines[:500])  # 최대 500줄
            return result if result.strip() else ""
        
        return ""
    except ImportError:
        print("olefile이 설치되지 않았습니다.", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"olefile 추출 실패: {e}", file=sys.stderr)
        return ""

def extract_text_with_pyhwp(input_path: str) -> str:
    """
    pyhwp를 사용하여 HWP 파일에서 텍스트 추출
    pyhwp는 복잡한 API이므로, 일단 olefile에 의존하는 방식으로 변경
    
    Args:
        input_path: 입력 HWP 파일 경로
        
    Returns:
        추출된 텍스트
    """
    # pyhwp는 API가 복잡하므로, olefile을 더 잘 활용하는 것이 나음
    # 일단 빈 문자열 반환 (olefile이 더 안정적)
    return ""

def extract_text_from_hwp(input_path: str) -> str:
    """
    HWP 파일에서 텍스트를 추출 (여러 방법 시도)
    
    Args:
        input_path: 입력 HWP 파일 경로
        
    Returns:
        추출된 텍스트
    """
    text = ""
    
    # 1. olefile을 사용한 추출 시도 (가장 안정적)
    text = extract_text_with_olefile(input_path)
    if text and len(text.strip()) > 20:
        # 텍스트 품질 검사
        # 깨진 문자나 바이너리 데이터가 많으면 제외
        broken_count = len(re.findall(r'[\uFFFD\x00-\x08\x0B-\x0C\x0E-\x1F]', text))
        meaningful_count = len(re.findall(r'[가-힣a-zA-Z0-9]', text))
        total_chars = len(text)
        
        if total_chars > 0:
            broken_ratio = broken_count / total_chars
            meaningful_ratio = meaningful_count / total_chars
            
            # 품질이 좋으면 반환
            if broken_ratio < 0.1 and meaningful_ratio > 0.3:
                return text
    
    # 2. pyhwp를 사용한 추출 시도 (보조)
    text = extract_text_with_pyhwp(input_path)
    if text and len(text.strip()) > 20:
        return text
    
    # 3. 기본적인 바이너리 텍스트 추출 (폴백)
    try:
        with open(input_path, 'rb') as f:
            content = f.read()
        
        # UTF-16 LE로 디코딩 시도
        try:
            decoded = content.decode('utf-16-le', errors='ignore')
            # 읽을 수 있는 텍스트만 추출
            readable = ''.join(c for c in decoded if c.isprintable() or c.isspace())
            # 연속된 공백 정리
            readable = ' '.join(readable.split())
            if len(readable.strip()) > 20:
                return readable.strip()
        except:
            pass
        
        # UTF-8로 디코딩 시도
        try:
            decoded = content.decode('utf-8', errors='ignore')
            readable = ''.join(c for c in decoded if c.isprintable() or c.isspace())
            readable = ' '.join(readable.split())
            if len(readable.strip()) > 20:
                return readable.strip()
        except:
            pass
    except Exception as e:
        print(f"기본 텍스트 추출 실패: {e}", file=sys.stderr)
    
    return text if text else "텍스트를 추출할 수 없습니다."

def convert_hwp_to_pdf(input_path: str, output_path: str):
    """
    HWP 파일을 PDF로 변환
    
    Args:
        input_path: 입력 HWP 파일 경로
        output_path: 출력 PDF 파일 경로
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        
        # 텍스트 추출
        print(f"📄 [HWP 변환] 텍스트 추출 시작: {input_path}", file=sys.stderr)
        text = extract_text_from_hwp(input_path)
        
        if not text or len(text.strip()) < 10:
            raise Exception("텍스트를 추출할 수 없습니다.")
        
        print(f"✅ [HWP 변환] 텍스트 추출 완료: {len(text)} 문자", file=sys.stderr)
        
        # PDF 생성 라이브러리 import
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.units import inch
        
        # 더 나은 PDF 생성 방법 사용
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # 스타일 설정
        styles = getSampleStyleSheet()
        
        # 한글 폰트 설정
        try:
            font_path = "C:/Windows/Fonts/malgun.ttf"
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont("Malgun", font_path))
                # 한글 스타일 생성
                korean_style = ParagraphStyle(
                    'KoreanStyle',
                    parent=styles['Normal'],
                    fontName='Malgun',
                    fontSize=12,
                    leading=18,
                    encoding='utf-8'
                )
            else:
                korean_style = styles['Normal']
        except:
            korean_style = styles['Normal']
        
        # 스토리 구성
        story = []
        lines = text.split('\n')
        line_count = 0
        max_lines = 1000  # 최대 1000줄
        
        for line in lines:
            if line_count >= max_lines:
                break
            
            line = line.strip()
            if not line:
                story.append(Spacer(1, 6))
                continue
            
            # 너무 긴 줄은 자르기
            if len(line) > 200:
                # 긴 줄을 여러 줄로 나누기
                words = line.split()
                current_line = ""
                for word in words:
                    if len(current_line + word) < 200:
                        current_line += word + " "
                    else:
                        if current_line:
                            try:
                                story.append(Paragraph(current_line.strip(), korean_style))
                                line_count += 1
                            except:
                                pass
                        current_line = word + " "
                if current_line:
                    try:
                        story.append(Paragraph(current_line.strip(), korean_style))
                        line_count += 1
                    except:
                        pass
            else:
                try:
                    story.append(Paragraph(line, korean_style))
                    line_count += 1
                except:
                    # 인코딩 문제 시 건너뛰기
                    pass
            
            # 페이지가 너무 길어지면 페이지 브레이크
            if line_count % 50 == 0:
                story.append(PageBreak())
        
        # PDF 생성
        doc.build(story)
        
        print(f"✅ [HWP 변환] PDF 생성 완료: {output_path}", file=sys.stderr)
        
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

