import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import cache, { CacheKeys } from "./cache";

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

interface NotionPage {
  id: string;
  properties: {
    title?: NotionTitle;
    slug?: { rich_text: NotionRichText[] };
    description?: { rich_text: NotionRichText[] };
    metaDescription?: { rich_text: NotionRichText[] };
    published?: { checkbox: boolean };
    Published?: { checkbox: boolean };
    blogPost?: { rich_text: NotionRichText[] };
    difficulty?: { select?: { name: string } | null };
    cookingtime?: unknown;
    image?: unknown;
    date?: { date: { start: string } | null };
    tags?: { multi_select: { name: string; color?: string }[] };
    category?: { rich_text: NotionRichText[] };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface NotionQueryResponse {
  results: NotionPage[];
  next_cursor?: string | null;
  has_more: boolean;
  [key: string]: unknown;
}

// 페이지네이션 결과 타입
export interface PaginatedRecipes {
  recipes: Recipe[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Recipe 인터페이스 정의
export interface Recipe {
  id: string;
  title: string;
  slug: string;
  metaDescription: string;
  description?: string; // description 속성도 지원
  published: boolean;
  blogPost?: string; // 선택적
  difficulty?: string;
  cookingTime?: string | number;
  category?: string;
  date?: string;
  tags?: string[];
  featuredImage?: string;
  image?: string; // image 속성도 지원
}

/**
 * Notion Recipe 클라이언트를 생성합니다
 * 환경 변수가 없으면 에러를 throw합니다
 */
function getNotionRecipeClient(): Client {
  let apiKey = process.env.NOTION_RECIPE_API_KEY;

  if (!apiKey) {
    throw new Error(
      "NOTION_RECIPE_API_KEY is not defined in environment variables. " +
        "Please add NOTION_RECIPE_API_KEY to your .env.local file."
    );
  }

  apiKey = apiKey.trim().replace(/^["']|["']$/g, "");

  try {
    const client = new Client({
      auth: apiKey,
    });

    if (!client || !client.databases) {
      throw new Error("Notion Recipe Client 생성 실패");
    }

    return client;
  } catch (error) {
    console.error("❌ Notion Recipe Client 생성 중 오류 발생:", error);
    throw error;
  }
}

/**
 * Notion to Markdown 변환기를 생성합니다 (Recipe용)
 */
function getNotionRecipeToMarkdown() {
  const notion = getNotionRecipeClient();
  return new NotionToMarkdown({ notionClient: notion });
}

/**
 * 요청 간 지연을 위한 헬퍼 함수
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 요청 큐를 위한 타입 정의
type QueuedRequest = {
  resolve: (value: NotionQueryResponse) => void;
  reject: (error: Error) => void;
  params: {
    database_id: string;
    filter?: NotionFilter;
    sorts?: NotionSort[];
    page_size?: number;
    start_cursor?: string;
  };
  retryCount: number;
};

// 요청 큐 및 처리 상태
const requestQueue: QueuedRequest[] = [];
let isProcessingQueue = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 500;

/**
 * 요청 큐를 순차적으로 처리하는 함수
 */
async function processRequestQueue(): Promise<void> {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (!request) break;

    try {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await delay(waitTime);
      }

      const result = await executeNotionRecipeRequest(request.params, request.retryCount);
      lastRequestTime = Date.now();
      request.resolve(result);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate Limit (429)')) {
        const maxRetries = 5;
        if (request.retryCount < maxRetries) {
          request.retryCount++;
          requestQueue.unshift(request);
          
          let waitTime = Math.min(Math.pow(2, request.retryCount) * 1000, 60000);
          const secondsMatch = error.message.match(/(\d+)초/);
          if (secondsMatch) {
            waitTime = parseInt(secondsMatch[1], 10) * 1000;
          } else {
            const msMatch = error.message.match(/(\d+)ms/);
            if (msMatch) {
              waitTime = parseInt(msMatch[1], 10);
            }
          }
          
          waitTime = Math.min(waitTime, 300000);
          await delay(waitTime);
        } else {
          request.reject(error);
        }
      } else {
        request.reject(error as Error);
      }
    }
  }

  isProcessingQueue = false;
}

/**
 * 실제 Notion Recipe API 요청을 실행하는 함수
 */
async function executeNotionRecipeRequest(params: {
  database_id: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  page_size?: number;
  start_cursor?: string;
}, retryCount: number = 0): Promise<NotionQueryResponse> {
  const apiKey = process.env.NOTION_RECIPE_API_KEY?.trim().replace(/^["']|["']$/g, "");

  if (!apiKey) {
    throw new Error("NOTION_RECIPE_API_KEY is not defined");
  }

  const body: {
    filter?: NotionFilter;
    sorts?: NotionSort[];
    page_size?: number;
    start_cursor?: string;
  } = {
    filter: params.filter,
    sorts: params.sorts,
  };

  if (params.page_size) {
    body.page_size = params.page_size;
  }

  if (params.start_cursor) {
    body.start_cursor = params.start_cursor;
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
      body: JSON.stringify(body),
    }
  );

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const errorText = await response.text();
    
    let waitTime: number;
    if (retryAfter) {
      waitTime = parseInt(retryAfter, 10) * 1000;
    } else {
      waitTime = Math.min(Math.pow(2, retryCount) * 1000, 60000);
    }

    throw new Error(`Notion API Rate Limit (429): ${waitTime / 1000}초 후 재시도 필요. ${errorText}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion Recipe API 오류 (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Notion Recipe API를 직접 호출하여 데이터베이스를 쿼리합니다
 */
async function queryNotionRecipeDatabase(params: {
  database_id: string;
  filter?: NotionFilter;
  sorts?: NotionSort[];
  page_size?: number;
  start_cursor?: string;
}, retryCount: number = 0): Promise<NotionQueryResponse> {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      resolve,
      reject,
      params,
      retryCount,
    });

    processRequestQueue().catch((error) => {
      console.error("요청 큐 처리 중 오류:", error);
    });
  });
}

/**
 * 마크다운 텍스트에서 첫 번째 이미지 URL을 추출합니다
 */
function extractFirstImageUrl(markdown: string): string | undefined {
  if (!markdown) return undefined;

  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i;
  const markdownMatch = markdown.match(markdownImageRegex);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1];
  }

  const htmlImageRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i;
  const htmlMatch = markdown.match(htmlImageRegex);
  if (htmlMatch && htmlMatch[1]) {
    return htmlMatch[1];
  }

  const urlImageRegex = /(https?:\/\/[^\s\)]+\.(jpg|jpeg|png|gif|webp|svg))/i;
  const urlMatch = markdown.match(urlImageRegex);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return undefined;
}

/**
 * Published된 레시피의 총 개수를 가져옵니다
 */
export async function getTotalRecipesCount(): Promise<number> {
  const cacheKey = `recipe_total_count`;
  const cached = cache.get<number>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  const databaseId = process.env.NOTION_RECIPE_DATABASE_ID;
  const publishedPropertyName = process.env.NOTION_RECIPE_PUBLISHED_PROPERTY || "published";

  if (!databaseId) {
    throw new Error(
      "NOTION_RECIPE_DATABASE_ID is not defined in environment variables."
    );
  }

  try {
    // Published 속성이 있는지 확인하기 위해 필터를 사용해 시도
    let data;
    try {
      data = await queryNotionRecipeDatabase({
        database_id: databaseId,
        filter: {
          property: publishedPropertyName,
          checkbox: {
            equals: true,
          },
        },
        page_size: 100,
      });
    } catch (filterError) {
      // Published 속성이 없으면 필터 없이 모든 레시피 가져오기
      if (filterError instanceof Error && filterError.message.includes("Could not find property")) {
        console.warn(`⚠️ "${publishedPropertyName}" 속성을 찾을 수 없습니다. 모든 레시피를 가져옵니다.`);
        data = await queryNotionRecipeDatabase({
          database_id: databaseId,
          page_size: 100,
        });
      } else {
        throw filterError;
      }
    }

    let totalCount = data.results.length;
    let cursor = data.next_cursor;

    while (cursor && data.has_more) {
      let nextData;
      try {
        nextData = await queryNotionRecipeDatabase({
          database_id: databaseId,
          filter: {
            property: publishedPropertyName,
            checkbox: {
              equals: true,
            },
          },
          page_size: 100,
          start_cursor: cursor,
        });
      } catch (filterError) {
        // Published 속성이 없으면 필터 없이 가져오기
        if (filterError instanceof Error && filterError.message.includes("Could not find property")) {
          nextData = await queryNotionRecipeDatabase({
            database_id: databaseId,
            page_size: 100,
            start_cursor: cursor,
          });
        } else {
          throw filterError;
        }
      }
      totalCount += nextData.results.length;
      cursor = nextData.next_cursor;
    }

    cache.set(cacheKey, totalCount, 60000);
    return totalCount;
  } catch (error) {
    console.error("Error fetching total recipes count:", error);
    throw error;
  }
}

/**
 * 페이지네이션을 지원하는 Published 레시피 조회
 */
export async function getPublishedRecipesPaginated(
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedRecipes> {
  const databaseId = process.env.NOTION_RECIPE_DATABASE_ID;
  const publishedPropertyName = process.env.NOTION_RECIPE_PUBLISHED_PROPERTY || "published";

  if (!databaseId) {
    throw new Error(
      "NOTION_RECIPE_DATABASE_ID is not defined in environment variables."
    );
  }

  try {
    const totalCount = await getTotalRecipesCount();
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));

    let allResults: NotionPage[] = [];
    let cursor: string | null | undefined = undefined;
    let hasMore = true;
    const targetStartIndex = (currentPage - 1) * pageSize;
    const targetEndIndex = targetStartIndex + pageSize;
    let useFilter = true; // 필터 사용 여부

    while (hasMore && allResults.length < targetEndIndex) {
      let data;
      try {
        data = await queryNotionRecipeDatabase({
          database_id: databaseId,
          filter: useFilter ? {
            property: publishedPropertyName,
            checkbox: {
              equals: true,
            },
          } : undefined,
          sorts: [
            {
              timestamp: "created_time",
              direction: "descending",
            },
          ],
          page_size: 100,
          start_cursor: cursor || undefined,
        });
      } catch (filterError) {
        // Published 속성이 없으면 필터 없이 가져오기
        if (filterError instanceof Error && filterError.message.includes("Could not find property")) {
          console.warn(`⚠️ "${publishedPropertyName}" 속성을 찾을 수 없습니다. 필터 없이 모든 레시피를 가져옵니다.`);
          useFilter = false;
          data = await queryNotionRecipeDatabase({
            database_id: databaseId,
            sorts: [
              {
                timestamp: "created_time",
                direction: "descending",
              },
            ],
            page_size: 100,
            start_cursor: cursor || undefined,
          });
        } else {
          throw filterError;
        }
      }

      allResults = allResults.concat(data.results);
      cursor = data.next_cursor;
      hasMore = data.has_more;

      if (allResults.length >= targetEndIndex) {
        break;
      }
    }

    const pageResults = allResults.slice(targetStartIndex, targetEndIndex);

    const recipes: Recipe[] = await Promise.all(
      pageResults.map(async (page: NotionPage) => {
        const blogPostContent = page.properties.blogPost?.rich_text
          ? page.properties.blogPost.rich_text
              .map((rt: NotionRichText) => rt.plain_text)
              .join("")
          : "";

        // description 또는 metaDescription 사용
        const description = page.properties.description?.rich_text?.[0]?.plain_text 
          || page.properties.metaDescription?.rich_text?.[0]?.plain_text 
          || "";

        // image 속성에서 이미지 URL 추출
        let featuredImage: string | undefined = undefined;
        
        // image 속성이 files 배열인 경우
        if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'files' in page.properties.image && Array.isArray(page.properties.image.files)) {
          const imageFile = page.properties.image.files[0];
          if (imageFile?.file?.url) {
            featuredImage = imageFile.file.url;
          }
        }
        // image 속성이 url인 경우
        else if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'url' in page.properties.image && typeof page.properties.image.url === 'string') {
          featuredImage = page.properties.image.url;
        }
        
        // image 속성이 없으면 blogPost나 본문에서 추출
        if (!featuredImage) {
          featuredImage = extractFirstImageUrl(blogPostContent);
          if (!featuredImage) {
            try {
              const fullContent = await getRecipeContent(page.id);
              featuredImage = extractFirstImageUrl(fullContent);
            } catch (error) {
              // 이미지 추출 실패는 무시
            }
          }
        }

        // published 속성 확인 (소문자 우선)
        const publishedValue = (page.properties.published || page.properties.Published) as { checkbox?: boolean } | undefined;
        const isPublished = publishedValue?.checkbox ?? true;

        // difficulty 추출
        const difficulty = page.properties.difficulty?.select?.name || undefined;

        // cookingtime 추출 (rich_text 또는 number)
        let cookingTime: string | number | undefined = undefined;
        if (page.properties.cookingtime && typeof page.properties.cookingtime === 'object' && page.properties.cookingtime !== null) {
          if ('rich_text' in page.properties.cookingtime && Array.isArray(page.properties.cookingtime.rich_text) && page.properties.cookingtime.rich_text?.[0]?.plain_text) {
            cookingTime = page.properties.cookingtime.rich_text[0].plain_text;
          } else if ('number' in page.properties.cookingtime && typeof page.properties.cookingtime.number === 'number') {
            cookingTime = page.properties.cookingtime.number;
          }
        }

        return {
          id: page.id,
          title: page.properties.title?.title[0]?.plain_text || "Untitled",
          slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
          metaDescription: description,
          description: description,
          published: isPublished,
          blogPost: blogPostContent || undefined,
          difficulty,
          cookingTime,
          category: page.properties.category?.rich_text?.[0]?.plain_text || undefined,
          featuredImage,
          image: featuredImage,
        };
      })
    );

    return {
      recipes,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  } catch (error) {
    console.error("Error fetching paginated recipes from Notion:", error);
    throw error;
  }
}

/**
 * 메인 페이지 전용: 캐시 없이 최신 레시피 N개 가져오기
 * @param limit 가져올 레시피 개수 (기본값: 3)
 * @returns 최신 레시피 배열
 */
export async function getLatestRecipes(limit: number = 3): Promise<Recipe[]> {
  const databaseId = process.env.NOTION_RECIPE_DATABASE_ID;
  const publishedPropertyName = process.env.NOTION_RECIPE_PUBLISHED_PROPERTY || "published";

  if (!databaseId) {
    throw new Error(
      "NOTION_RECIPE_DATABASE_ID is not defined in environment variables."
    );
  }

  try {
    let data;
    let useFilter = true;

    try {
      // Published 속성이 있는 경우 필터 사용
      data = await queryNotionRecipeDatabase({
        database_id: databaseId,
        filter: {
          property: publishedPropertyName,
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
        page_size: limit,
      });
    } catch (filterError) {
      // Published 속성이 없으면 필터 없이 가져오기
      if (filterError instanceof Error && filterError.message.includes("Could not find property")) {
        useFilter = false;
        data = await queryNotionRecipeDatabase({
          database_id: databaseId,
          sorts: [
            {
              timestamp: "created_time",
              direction: "descending",
            },
          ],
          page_size: limit,
        });
      } else {
        throw filterError;
      }
    }

    const recipes: Recipe[] = await Promise.all(
      data.results.map(async (page: NotionPage) => {
        const blogPostContent = page.properties.blogPost?.rich_text
          ? page.properties.blogPost.rich_text
              .map((rt: NotionRichText) => rt.plain_text)
              .join("")
          : "";

        // description 또는 metaDescription 사용
        const description = page.properties.description?.rich_text?.[0]?.plain_text 
          || page.properties.metaDescription?.rich_text?.[0]?.plain_text 
          || "";

        // image 속성에서 이미지 URL 추출
        let featuredImage: string | undefined = undefined;
        
        // image 속성이 files 배열인 경우
        if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'files' in page.properties.image && Array.isArray(page.properties.image.files)) {
          const imageFile = page.properties.image.files[0];
          if (imageFile?.file?.url) {
            featuredImage = imageFile.file.url;
          }
        }
        // image 속성이 url인 경우
        else if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'url' in page.properties.image && typeof page.properties.image.url === 'string') {
          featuredImage = page.properties.image.url;
        }
        
        // image 속성이 없으면 blogPost나 본문에서 추출
        if (!featuredImage) {
          featuredImage = extractFirstImageUrl(blogPostContent);
          if (!featuredImage) {
            try {
              const fullContent = await getRecipeContent(page.id);
              featuredImage = extractFirstImageUrl(fullContent);
            } catch (error) {
              // 이미지 추출 실패는 무시
            }
          }
        }

        // published 속성 확인 (소문자 우선)
        const publishedValue = (page.properties.published || page.properties.Published) as { checkbox?: boolean } | undefined;
        const isPublished = publishedValue?.checkbox ?? true;

        // difficulty 추출
        const difficulty = page.properties.difficulty?.select?.name || undefined;

        // cookingtime 추출 (rich_text 또는 number)
        let cookingTime: string | number | undefined = undefined;
        if (page.properties.cookingtime && typeof page.properties.cookingtime === 'object' && page.properties.cookingtime !== null) {
          if ('rich_text' in page.properties.cookingtime && Array.isArray(page.properties.cookingtime.rich_text) && page.properties.cookingtime.rich_text?.[0]?.plain_text) {
            cookingTime = page.properties.cookingtime.rich_text[0].plain_text;
          } else if ('number' in page.properties.cookingtime && typeof page.properties.cookingtime.number === 'number') {
            cookingTime = page.properties.cookingtime.number;
          }
        }

        return {
          id: page.id,
          title: page.properties.title?.title[0]?.plain_text || "Untitled",
          slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
          metaDescription: description,
          description: description,
          published: isPublished,
          blogPost: blogPostContent || undefined,
          difficulty,
          cookingTime,
          category: page.properties.category?.rich_text?.[0]?.plain_text || undefined,
          featuredImage,
          image: featuredImage,
        };
      })
    );

    return recipes;
  } catch (error) {
    console.error("Error fetching latest recipes from Notion:", error);
    throw error;
  }
}

/**
 * Slug로 특정 레시피를 가져옵니다
 */
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const cacheKey = `recipe_slug_${slug}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get<Recipe | null>(cacheKey);
    return cached;
  }

  const databaseId = process.env.NOTION_RECIPE_DATABASE_ID;
  const publishedPropertyName = process.env.NOTION_RECIPE_PUBLISHED_PROPERTY || "published";

  if (!databaseId) {
    throw new Error(
      "NOTION_RECIPE_DATABASE_ID is not defined in environment variables."
    );
  }

  try {
    let data;
    try {
      // Published 속성이 있는 경우 필터 사용
      data = await queryNotionRecipeDatabase({
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
              property: publishedPropertyName,
              checkbox: {
                equals: true,
              },
            },
          ],
        },
      });
    } catch (filterError) {
      // Published 속성이 없으면 slug만으로 필터링
      if (filterError instanceof Error && filterError.message.includes("Could not find property")) {
        data = await queryNotionRecipeDatabase({
          database_id: databaseId,
          filter: {
            property: "slug",
            rich_text: {
              equals: slug,
            },
          },
        });
      } else {
        throw filterError;
      }
    }

    if (data.results.length === 0) {
      cache.set(cacheKey, null, 60000);
      return null;
    }

    const page: NotionPage = data.results[0];
    
    // published 속성 확인 (소문자 우선)
    const publishedValue = (page.properties.published || page.properties.Published) as { checkbox?: boolean } | undefined;
    const isPublished = publishedValue?.checkbox ?? true;

    // description 또는 metaDescription 사용
    const description = page.properties.description?.rich_text?.[0]?.plain_text 
      || page.properties.metaDescription?.rich_text?.[0]?.plain_text 
      || "";

    // blogPost 추출
    const blogPostContent = page.properties.blogPost?.rich_text
      ? page.properties.blogPost.rich_text
          .map((rt: NotionRichText) => rt.plain_text)
          .join("")
      : "";

    // image 속성에서 이미지 URL 추출
    let imageUrl: string | undefined = undefined;
    if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'files' in page.properties.image && Array.isArray(page.properties.image.files)) {
      const imageFile = page.properties.image.files[0];
      if (imageFile?.file?.url) {
        imageUrl = imageFile.file.url;
      }
    } else if (page.properties.image && typeof page.properties.image === 'object' && page.properties.image !== null && 'url' in page.properties.image && typeof page.properties.image.url === 'string') {
      imageUrl = page.properties.image.url;
    }

    // difficulty 추출
    const difficulty = page.properties.difficulty?.select?.name || undefined;

    // cookingtime 추출
    let cookingTime: string | number | undefined = undefined;
    if (page.properties.cookingtime && typeof page.properties.cookingtime === 'object' && page.properties.cookingtime !== null) {
      if ('rich_text' in page.properties.cookingtime && Array.isArray(page.properties.cookingtime.rich_text) && page.properties.cookingtime.rich_text?.[0]?.plain_text) {
        cookingTime = page.properties.cookingtime.rich_text[0].plain_text;
      } else if ('number' in page.properties.cookingtime && typeof page.properties.cookingtime.number === 'number') {
        cookingTime = page.properties.cookingtime.number;
      }
    }
    
    const recipe = {
      id: page.id,
      title: page.properties.title?.title[0]?.plain_text || "Untitled",
      slug: page.properties.slug?.rich_text?.[0]?.plain_text || "",
      metaDescription: description,
      description: description,
      published: isPublished,
      blogPost: blogPostContent || undefined,
      difficulty,
      cookingTime,
      category: page.properties.category?.rich_text?.[0]?.plain_text || undefined,
      date: page.properties.date?.date?.start || undefined,
      tags: page.properties.tags?.multi_select?.map((tag) => tag.name) || undefined,
      featuredImage: imageUrl,
      image: imageUrl,
    };

    cache.set(cacheKey, recipe, 60000);
    return recipe;
  } catch (error) {
    console.error("Error fetching recipe by slug:", error);
    throw error;
  }
}

/**
 * Notion 레시피 페이지의 콘텐츠를 마크다운으로 변환합니다
 */
export async function getRecipeContent(pageId: string): Promise<string> {
  const cacheKey = `recipe_content_${pageId}`;
  const cached = cache.get<string>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const n2m = getNotionRecipeToMarkdown();
    const mdblocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdblocks);
    const markdownContent = mdString.parent || "";

    cache.set(cacheKey, markdownContent, 60000);
    return markdownContent;
  } catch (error) {
    console.error("Error converting Notion recipe page to markdown:", error);
    throw error;
  }
}

/**
 * 검색어로 레시피를 검색합니다
 */
export async function searchRecipes(
  query: string,
  page: number = 1,
  pageSize: number = 12
): Promise<PaginatedRecipes> {
  const databaseId = process.env.NOTION_RECIPE_DATABASE_ID;

  if (!databaseId) {
    throw new Error(
      "NOTION_RECIPE_DATABASE_ID is not defined in environment variables."
    );
  }

  try {
    // 먼저 모든 Published 레시피를 가져온 후 클라이언트 측에서 필터링
    // (Notion API의 검색 기능은 복잡하므로 간단하게 구현)
    const allData = await getPublishedRecipesPaginated(1, 1000);
    
    const searchLower = query.toLowerCase();
    const filteredRecipes = allData.recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.metaDescription.toLowerCase().includes(searchLower) ||
        recipe.category?.toLowerCase().includes(searchLower) ||
        recipe.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
    );

    const totalCount = filteredRecipes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages || 1));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageRecipes = filteredRecipes.slice(startIndex, endIndex);

    return {
      recipes: pageRecipes,
      totalCount,
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  } catch (error) {
    console.error("Error searching recipes:", error);
    throw error;
  }
}

