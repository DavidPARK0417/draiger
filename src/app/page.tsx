import { getLatestPosts, type Post } from "@/lib/notion";
import { getLatestRecipes, type Recipe } from "@/lib/notion-recipe";
import PostCard from "@/components/PostCard";
import SmallPostCard from "@/components/SmallPostCard";
import MenuCard from "@/components/MenuCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Link from "next/link";
import { UtensilsCrossed, Lightbulb, ArrowRight } from "lucide-react";
import type { Metadata } from 'next';
import { getBaseUrl } from "@/lib/site";

// ISR 설정: 60초마다 재검증 (더 빠른 업데이트를 원하면 30초로 조정 가능)
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구',
  description: '마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.',
  keywords: [
    'Draiger',
    '데일리 툴킷',
    '마케팅 도구',
    'ROI 계산기',
    '광고 예산 계산기',
    '키워드 분석',
    '손익분기점 계산',
    '광고 성과 분석',
    '마케팅 분석',
    '디지털 마케팅',
    '광고 최적화',
    'CRO 계산기',
    '스마트 도구',
    '인사이트',
    '트렌드',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구',
    description: '마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Draiger : 데일리 툴킷 - 매일 쌓이는 지식과 꼭 필요한 스마트 도구',
    description: '마케팅, 트렌드, 일상의 유용한 정보가 매일 자동으로 업데이트됩니다. 지식을 채워주는 전문 인사이트 콘텐츠와 이를 즉시 실행에 옮길 수 있는 스마트 도구들을 데일리 툴킷(Draiger)에서 한 번에 만나보세요.',
  },
};

interface RecipeSectionProps {
  recipes: Recipe[];
}

function RecipeSection({ recipes }: RecipeSectionProps) {
  if (recipes.length === 0) return null;

  const [mainRecipe, ...smallRecipes] = recipes;
  const smallRecipesToShow = smallRecipes.slice(0, 2);

  return (
    <section className="mb-16 sm:mb-20 lg:mb-24">
      {/* 섹션 제목 */}
      <div className="mb-6 sm:mb-8" suppressHydrationWarning>
        <Link
          href="/menu"
          className="group inline-flex items-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
        >
          <UtensilsCrossed 
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-500 dark:text-emerald-400" 
            strokeWidth={2.5}
          />
          <span>오늘의 메뉴</span>
          <ArrowRight 
            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
            strokeWidth={2.5}
          />
        </Link>
      </div>

      {/* 카드 레이아웃: 큰 카드 1개 + 작은 카드 2개 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 큰 카드 (왼쪽) */}
        <div className="lg:col-span-2">
          {mainRecipe && (
            <MenuCard recipe={mainRecipe} index={0} isLarge={true} />
          )}
        </div>

        {/* 작은 카드들 (오른쪽) */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          {smallRecipesToShow.map((recipe, index) => (
            <MenuCard
              key={recipe.id}
              recipe={recipe}
              index={index + 1}
              isLarge={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface InsightSectionProps {
  posts: Post[];
}

function InsightSection({ posts }: InsightSectionProps) {
  if (posts.length === 0) return null;

  const [mainPost, ...smallPosts] = posts;
  const smallPostsToShow = smallPosts.slice(0, 2);

  return (
    <section className="mb-16 sm:mb-20 lg:mb-24">
      {/* 섹션 제목 */}
      <div className="mb-6 sm:mb-8" suppressHydrationWarning>
        <Link
          href="/insight"
          className="group inline-flex items-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
        >
          <Lightbulb 
            className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-500 dark:text-emerald-400" 
            strokeWidth={2.5}
          />
          <span>인사이트</span>
          <ArrowRight 
            className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" 
            strokeWidth={2.5}
          />
        </Link>
      </div>

      {/* 카드 레이아웃: 큰 카드 1개 + 작은 카드 2개 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 큰 카드 (왼쪽) */}
        <div className="lg:col-span-2">
          {mainPost && (
            <PostCard post={mainPost} index={0} isLarge={true} />
          )}
        </div>

        {/* 작은 카드들 (오른쪽) */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
          {smallPostsToShow.map((post, index) => (
            <SmallPostCard
              key={post.id}
              post={post}
              index={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  // 캐시 없이 최신 레시피 3개와 최신 인사이트 3개 가져오기
  let recipes: Recipe[] = [];
  let posts: Post[] = [];

  try {
    // 캐시 없이 최신 레시피 3개 가져오기
    recipes = await getLatestRecipes(3);
  } catch (error) {
    console.error("레시피 조회 실패:", error);
  }

  try {
    // 캐시 없이 최신 인사이트 3개 가져오기
    posts = await getLatestPosts(3);
  } catch (error) {
    console.error("인사이트 글 조회 실패:", error);
  }

  const hasContent = recipes.length > 0 || posts.length > 0;
  const baseUrl = getBaseUrl();

  // 구조화된 데이터 (JSON-LD) 생성
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Draiger : 데일리 툴킷",
    "description": "매일 쌓이는 지식과 꼭 필요한 스마트 도구",
    "url": baseUrl,
    "mainEntity": {
      "@type": "ItemList",
      "name": "최신 콘텐츠",
      "description": "오늘의 메뉴와 인사이트 최신 글",
      "numberOfItems": recipes.length + posts.length,
      "itemListElement": [
        ...recipes.map((recipe, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Recipe",
            "name": recipe.title,
            "url": `${baseUrl}/menu/${recipe.slug}`,
            "description": recipe.metaDescription || recipe.description,
            ...(recipe.featuredImage && { "image": recipe.featuredImage }),
            ...(recipe.difficulty && { "recipeCategory": recipe.difficulty }),
            ...(recipe.cookingTime && { "totalTime": `PT${recipe.cookingTime}M` }),
          }
        })),
        ...posts.map((post, index) => ({
          "@type": "ListItem",
          "position": recipes.length + index + 1,
          "item": {
            "@type": "Article",
            "headline": post.title,
            "url": `${baseUrl}/insight/${post.slug}`,
            "description": post.metaDescription,
            ...(post.featuredImage && { "image": post.featuredImage }),
            ...(post.category && { "articleSection": post.category }),
            "author": {
              "@type": "Person",
              "name": "박용범"
            },
            "publisher": {
              "@type": "Person",
              "name": "박용범"
            }
          }
        }))
      ]
    }
  };

  return (
    <SmoothScroll>
      {/* 구조화된 데이터 (JSON-LD) - SEO 최적화 */}
      {hasContent && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
        <GrainOverlay />
        <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {!hasContent ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                게시글이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-16 sm:space-y-20 lg:space-y-24">
              {/* 오늘의 메뉴 섹션 */}
              <RecipeSection recipes={recipes} />

              {/* 인사이트 섹션 */}
              <InsightSection posts={posts} />
            </div>
          )}
        </main>
      </div>
    </SmoothScroll>
  );
}
