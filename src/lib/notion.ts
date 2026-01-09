import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// Notion API 타입 정의
interface NotionFilter {
  property?: string;
  checkbox?: { equals: boolean };
  rich_text?: { equals: string };
  select?: { equals: string };
  and?: NotionFilter[];
  [key: string]: unknown;
}

interface NotionSort {
  timestamp?: "created_time" | "last_edited_time";
  direction?: "ascending" | "descending";
  property?: string;
  [key: string]: unknown;
}

interface NotionRichText {
  plain_text: string;
  [key: string]: unknown;
}

interface NotionTitle {
  title: NotionRichText[];
}

interface NotionProperty {
  title?: NotionTitle;
  rich_text?: NotionRichText[];
  checkbox?: boolean;
  select?: { name: string };
  [key: string]: unknown;
}

interface NotionPage {
  id: string;
  properties: {
    title?: NotionTitle;
    slug?: { rich_text: NotionRichText[] };
    metaDescription?: { rich_text: NotionRichText[] };
    Published?: { checkbox: boolean };
    blogPost?: { rich_text: NotionRichText[] };
    category?: { select: { name: string } };
    [key: string]: NotionProperty;
  };
  [key: string]: unknown;
}

interface NotionQueryResponse {
  results: NotionPage[];
  [key: string]: unknown;
}

/**
 * Notion 클라이언트를 생성합니다
 * 환경 변수가 없으면 에러를 throw합니다
 */
function getNotionClient(): Client {
  // 환경 변수에서 API 키 가져오기 (따옴표 제거)
  let apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEY is not defined in environment variables. " +
        "Please add NOTION_API_KEY to your .env.local file."
    );
  }

  // 환경 변수에서 따옴표가 포함되어 있을 수 있으므로 제거
  apiKey = apiKey.trim().replace(/^["']|["']$/g, "");

  // API 키 형식 검증 및 로깅
  console.log("🔑 API 키 확인:", {
    keyPrefix: apiKey.substring(0, 10) + "...",
    keyLength: apiKey.length,
    startsWithSecret: apiKey.startsWith("secret_"),
    startsWithNtn: apiKey.startsWith("ntn_"),
  });

  if (!apiKey.startsWith("secret_") && !apiKey.startsWith("ntn_")) {
    console.warn(
      "⚠️ WARNING: NOTION_API_KEY 형식이 예상과 다릅니다. " +
        "일반적으로 'secret_' 또는 'ntn_'으로 시작해야 합니다. " +
        "현재 키: " +
        apiKey.substring(0, 10) +
        "..."
    );
  }

  try {
    const client = new Client({
      auth: apiKey,
    });

    // 클라이언트가 제대로 생성되었는지 확인
    if (!client) {
      throw new Error("Notion Client 생성 실패: 클라이언트 객체가 null입니다.");
    }

    // databases 속성이 존재하는지 확인
    if (!client.databases) {
      throw new Error(
        "Notion Client 생성 실패: 'databases' 속성이 없습니다. " +
          "SDK 버전이나 초기화 방식에 문제가 있을 수 있습니다."
      );
    }

    // 사용 가능한 메서드 확인 및 로깅
    const databasesKeys = Object.keys(client.databases);
    console.log("📋 사용 가능한 databases 메서드:", databasesKeys);

    // query 메서드가 없으므로 직접 HTTP API를 사용합니다
    console.log(
      "✅ Notion Client가 생성되었습니다. (HTTP API를 직접 사용합니다)"
    );

    return client;
  } catch (error) {
    console.error("❌ Notion Client 생성 중 오류 발생:", error);
    throw error;
  }
}

/**
 * Notion to Markdown 변환기를 생성합니다
 */
function getNotionToMarkdown() {
  const notion = getNotionClient();
  return new NotionToMarkdown({ notionClient: notion });
}

/**
 * Notion API를 직접 호출하여 데이터베이스를 쿼리합니다
 * SDK에 query 메서드가 없을 때 사용합니다
 */
async function queryNotionDatabase(params: {
  database_id: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
}): Promise<NotionQueryResponse> {
  const apiKey = process.env.NOTION_API_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not defined");
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${params.database_id}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: params.filter,
        sorts: params.sorts,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion API 오류 (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Post 인터페이스 정의
export interface Post {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  published: boolean;
  blogPost: string;
  category?: string; // 카테고리 추가
}

/**
 * Published된 모든 게시글을 가져옵니다
 * 생성일 기준 내림차순으로 정렬됩니다
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in environment variables. " +
        "Please add NOTION_DATABASE_ID to your .env.local file."
    );
  }

  try {
    // SDK에 query 메서드가 없으므로 직접 HTTP API 호출
    const data = await queryNotionDatabase({
      database_id: databaseId,
      filter: {
        property: "Published",
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });

    return data.results.map((page: NotionPage) => ({
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || "Untitled",
      slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
      metaDescription:
        page.properties.metaDescription?.rich_text?.[0]?.plain_text || "",
      published: page.properties.Published?.checkbox || false,
      blogPost: page.properties.blogPost?.rich_text
        ? page.properties.blogPost.rich_text
            .map((rt: NotionRichText) => rt.plain_text)
            .join("")
        : "",
      category: page.properties.category?.select?.name || undefined,
    }));
  } catch (error) {
    console.error("Error fetching posts from Notion:", error);
    throw error;
  }
}

/**
 * 카테고리별 Published 게시글을 가져옵니다
 * 
 * 주의: Notion 데이터베이스에 'category' 속성이 없을 경우,
 * 모든 Published 게시글을 가져온 후 클라이언트 측에서 필터링합니다.
 */
export async function getPublishedPostsByCategory(
  category: string
): Promise<Post[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in environment variables. " +
        "Please add NOTION_DATABASE_ID to your .env.local file."
    );
  }

  try {
    // 먼저 category 속성으로 필터링 시도
    try {
      const data = await queryNotionDatabase({
        database_id: databaseId,
        filter: {
          and: [
            {
              property: "Published",
              checkbox: {
                equals: true,
              },
            },
            {
              property: "category",
              select: {
                equals: category,
              },
            },
          ],
        },
        sorts: [
          {
            timestamp: "created_time",
            direction: "descending",
          },
        ],
      });

      return data.results.map((page: NotionPage) => ({
        id: page.id,
        title: page.properties.title?.title[0]?.plain_text || "Untitled",
        slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
        metaDescription:
          page.properties.metaDescription?.rich_text?.[0]?.plain_text || "",
        published: page.properties.Published?.checkbox || false,
        blogPost: page.properties.blogPost?.rich_text
          ? page.properties.blogPost.rich_text
              .map((rt: NotionRichText) => rt.plain_text)
              .join("")
          : "",
        category: page.properties.category?.select?.name || undefined,
      }));
    } catch (categoryError: unknown) {
      // category 속성이 없는 경우 (validation_error)
      const errorMessage =
        categoryError instanceof Error
          ? categoryError.message
          : String(categoryError);
      if (
        errorMessage.includes("validation_error") &&
        errorMessage.includes("category")
      ) {
        console.warn(
          "⚠️ Notion 데이터베이스에 'category' 속성이 없습니다. " +
            "모든 게시글을 가져온 후 클라이언트 측에서 필터링합니다."
        );

        // 모든 Published 게시글을 가져온 후 클라이언트 측에서 필터링
        const allPosts = await getPublishedPosts();
        
        // category 속성이 있는 게시글만 필터링
        return allPosts.filter(
          (post) => post.category && post.category === category
        );
      }
      
      // 다른 에러는 그대로 throw
      throw categoryError;
    }
  } catch (error) {
    console.error("Error fetching posts by category from Notion:", error);
    throw error;
  }
}

/**
 * Slug로 특정 게시글을 가져옵니다
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error(
      "NOTION_DATABASE_ID is not defined in environment variables. " +
        "Please add NOTION_DATABASE_ID to your .env.local file."
    );
  }

  try {
    const data = await queryNotionDatabase({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "slug",
            rich_text: {
              equals: slug,
            },
          },
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
    });

    if (data.results.length === 0) return null;

    const page: NotionPage = data.results[0];
    return {
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || "Untitled",
      slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
      metaDescription:
        page.properties.metaDescription?.rich_text?.[0]?.plain_text || "",
      published: page.properties.Published?.checkbox || false,
      blogPost: page.properties.blogPost?.rich_text
        ? page.properties.blogPost.rich_text
            .map((rt: NotionRichText) => rt.plain_text)
            .join("")
        : "",
      category: page.properties.category?.select?.name || undefined,
    };
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    throw error;
  }
}

/**
 * Notion 페이지의 콘텐츠를 마크다운으로 변환합니다
 */
export async function getPostContent(pageId: string): Promise<string> {
  try {
    const n2m = getNotionToMarkdown();
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    return mdString.parent || "";
  } catch (error) {
    console.error("Error converting Notion page to markdown:", error);
    throw error;
  }
}
