"use client";

import React from "react";
import TagCopySection from "@/components/TagCopySection";

interface ClientRecipeContentProps {
  title: string;
  tags: string[];
  children: React.ReactNode;
}

export default function ClientRecipeContent({
  title,
  tags,
  children,
}: ClientRecipeContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const descriptionRef = React.useRef<HTMLDivElement>(null);

  // 본문 복사 시 블로그 최적화를 위해 약간의 스타일 보정이나 처리가 필요할 수 있습니다.
  // 현재는 TagCopySection에 ref만 전달하여 복사 기능을 수행합니다.

  // children에서 첫 번째 자식(Description 박스)을 찾아 ref를 연결하기 위해
  // children을 배열로 변환하여 처리
  const childrenArray = React.Children.toArray(children);
  const description = childrenArray[0];
  const restOfContent = childrenArray.slice(1);

  return (
    <>
      <div className="recipe-content-container">
        {/* 요약 박스 영역 */}
        <div ref={descriptionRef}>{description}</div>

        {/* 나머지 본문 영역 */}
        <div ref={contentRef}>{restOfContent}</div>
      </div>

      {tags && tags.length > 0 && (
        <TagCopySection
          title={title}
          tags={tags}
          contentRef={contentRef}
          descriptionRef={descriptionRef}
        />
      )}
    </>
  );
}
