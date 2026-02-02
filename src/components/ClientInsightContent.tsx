"use client";

import React from "react";
import TagCopySection from "@/components/TagCopySection";

interface ClientInsightContentProps {
  title: string;
  tags: string[];
  children: React.ReactNode;
}

export default function ClientInsightContent({
  title,
  tags,
  children,
}: ClientInsightContentProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const descriptionRef = React.useRef<HTMLDivElement>(null);

  // children을 배열로 변환하여 요약 박스와 본문 영역을 분리
  const childrenArray = React.Children.toArray(children);
  const description = childrenArray[0];
  const restOfContent = childrenArray.slice(1);

  return (
    <>
      <div className="insight-content-container">
        {/* 요약 박스 영역 (descriptionRef) */}
        <div ref={descriptionRef}>{description}</div>

        {/* 나머지 본문 영역 (contentRef) */}
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
