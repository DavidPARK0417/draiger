/**
 * 메모리 기반 캐싱 시스템
 * Notion API 호출을 최소화하기 위한 간단한 인메모리 캐시
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * 캐시에서 데이터 가져오기
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // TTL 확인
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // 만료된 캐시 삭제
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 캐시에 키가 존재하는지 확인 (TTL 체크 포함)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key) as CacheEntry<unknown> | undefined;
    if (!entry) {
      return false;
    }

    // TTL 확인
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // 만료된 캐시 삭제
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 캐시에 데이터 저장
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttl Time To Live (밀리초, 기본값: 60초)
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * 캐시에서 특정 키 삭제
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 패턴과 일치하는 모든 캐시 삭제
   */
  deletePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 크기 반환
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    const keys = Array.from(this.cache.keys());

    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// 싱글톤 인스턴스
const cache = new MemoryCache();

// 주기적으로 만료된 캐시 정리 (5분마다)
if (typeof window === 'undefined') {
  // 서버 환경에서만 실행
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export default cache;

/**
 * 캐시 키 생성 헬퍼 함수들
 */
export const CacheKeys = {
  // 전체 게시글
  allPosts: () => 'posts:all',
  
  // 페이지네이션된 게시글
  postsPaginated: (page: number, pageSize: number) => `posts:paginated:${page}:${pageSize}`,
  
  // 카테고리별 게시글
  postsByCategory: (category: string) => `posts:category:${category}`,
  
  // 카테고리별 페이지네이션된 게시글
  postsByCategoryPaginated: (category: string, page: number, pageSize: number) =>
    `posts:category:${category}:paginated:${page}:${pageSize}`,
  
  // 카테고리별 최신 게시글
  latestPostsByCategory: (category: string, limit: number) =>
    `posts:category:${category}:latest:${limit}`,
  
  // slug로 게시글 조회
  postBySlug: (slug: string) => `post:slug:${slug}`,
  
  // 게시글 콘텐츠
  postContent: (postId: string) => `post:content:${postId}`,
  
  // 전체 게시글 수
  totalPostsCount: () => 'posts:count:total',
  
  // 카테고리별 게시글 수
  categoryPostsCount: (category: string) => `posts:count:category:${category}`,
};

