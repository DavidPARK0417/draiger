"use client";

import React from "react";
import TagCopySection from "@/components/TagCopySection";
import TextToSpeech from "@/components/TextToSpeech";

interface ClientInsightContentProps {
  title: string;
  tags: string[];
  children: React.ReactNode;
  metaDescription?: string;
  content?: string;
  adComponent?: React.ReactNode;
  category?: string;
}

export default function ClientInsightContent({
  title,
  tags,
  children,
  metaDescription,
  content,
  adComponent,
  category,
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
        {/* 1. 상단 복사 버튼 영역 - ref 연결 */}
        <TagCopySection
          title={title}
          tags={tags}
          contentRef={contentRef}
          descriptionRef={descriptionRef}
          onlyButtons={true}
          className="mb-6"
          type="insight"
          category={category}
        />

        {/* 2. 요약 박스 영역 (descriptionRef) */}
        <div ref={descriptionRef} className="mb-8">
          {description}
        </div>

        {/* 3. 카카오 애드핏 광고 (요약 박스 아래 배치) */}
        {adComponent && (
          <div className="mb-8 sm:mb-12 flex justify-center">{adComponent}</div>
        )}

        {/* 4. 음성 읽기 컴포넌트 (광고 아래 배치) */}
        {content && (
          <div className="mb-10 sm:mb-12">
            <TextToSpeech
              content={content}
              title={title}
              metaDescription={metaDescription}
            />
          </div>
        )}

        {/* 5. 나머지 본문 영역 (contentRef) */}
        <div ref={contentRef}>{restOfContent}</div>

        {/* 태그 영역 (본문 하단) */}
        {tags && tags.length > 0 && (
          <TagCopySection
            title={title}
            tags={tags}
            contentRef={contentRef}
            descriptionRef={descriptionRef}
            onlyTags={true}
            type="insight"
            category={category}
          />
        )}
      </div>
    </>
  );
}
