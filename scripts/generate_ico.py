#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
고품질 ICO 파일 생성 스크립트
Pillow를 사용하여 멀티 사이즈(16x16, 32x32, 48x48) ICO 파일을 생성합니다.

필요한 패키지:
- Pillow: pip install Pillow

사용법:
python generate_ico.py <입력_이미지_경로> <출력_ICO_경로>
"""

import sys
import os
from io import BytesIO

def create_ico_file(input_path: str, output_path: str):
    """
    이미지를 멀티 사이즈 ICO 파일로 변환
    
    Args:
        input_path: 입력 이미지 파일 경로
        output_path: 출력 ICO 파일 경로
    """
    try:
        from PIL import Image, ImageFilter
        
        # 이미지 열기
        print(f"📷 [ICO 생성] 이미지 로드: {input_path}", file=sys.stderr)
        img = Image.open(input_path)
        
        # RGBA 모드로 변환 (투명도 지원)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # 정사각형으로 크롭 (필요한 경우)
        width, height = img.size
        if width != height:
            size = min(width, height)
            left = (width - size) // 2
            top = (height - size) // 2
            img = img.crop((left, top, left + size, top + size))
            print(f"✂️ [ICO 생성] 이미지 크롭: {size}x{size}", file=sys.stderr)
        
        # 멀티 사이즈 이미지 생성 (16x16, 32x32, 48x48)
        sizes = [16, 32, 48]
        resized_images = []
        
        for size in sizes:
            # Lanczos 리샘플링을 사용한 고품질 리사이징
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # 선명도 향상을 위한 약간의 샤프닝 (선택적)
            # resized = resized.filter(ImageFilter.SHARPEN)
            
            resized_images.append(resized)
            print(f"✅ [ICO 생성] {size}x{size} 리사이징 완료", file=sys.stderr)
        
        # ICO 파일로 저장 (멀티 사이즈 포함)
        # Pillow는 자동으로 멀티 사이즈 ICO를 생성합니다
        img.save(
            output_path,
            format='ICO',
            sizes=[(s, s) for s in sizes]
        )
        
        print(f"✅ [ICO 생성] ICO 파일 생성 완료: {output_path}", file=sys.stderr)
        print(f"📦 [ICO 생성] 포함된 사이즈: {', '.join([f'{s}x{s}' for s in sizes])}", file=sys.stderr)
        
    except ImportError:
        print("❌ [ICO 생성] Pillow가 설치되지 않았습니다.", file=sys.stderr)
        print("다음 명령어로 설치하세요: pip install Pillow", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ [ICO 생성] 오류 발생: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("사용법: python generate_ico.py <입력_이미지_경로> <출력_ICO_경로>", file=sys.stderr)
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(input_path):
        print(f"❌ [ICO 생성] 입력 파일을 찾을 수 없습니다: {input_path}", file=sys.stderr)
        sys.exit(1)
    
    create_ico_file(input_path, output_path)

