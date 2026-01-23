"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MenuCard from "@/components/MenuCard";
import SmoothScroll from "@/components/SmoothScroll";
import GrainOverlay from "@/components/GrainOverlay";
import Pagination from "@/components/Pagination";
import { Search } from "lucide-react";
import { Recipe } from "@/lib/notion-recipe";

interface PaginatedRecipes {
  recipes: Recipe[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function MenuPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10) || 1;
    const query = searchParams.get("q") || "";
    setCurrentPage(page);
    setSearchQuery(query);
    setSearchInput(query);

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        let data: PaginatedRecipes;
        
        if (query) {
          const response = await fetch(
            `/api/menu/search?q=${encodeURIComponent(query)}&page=${page}`
          );
          const responseData = await response.json();
          
          if (!response.ok) {
            const errorMsg = responseData.error || "검색 실패";
            console.error("레시피 검색 오류:", errorMsg);
            throw new Error(errorMsg);
          }
          
          data = responseData;
        } else {
          const response = await fetch(`/api/menu?page=${page}`);
          const responseData = await response.json();
          
          if (!response.ok) {
            const errorMsg = responseData.error || "레시피 조회 실패";
            console.error("레시피 조회 오류:", errorMsg);
            throw new Error(errorMsg);
          }
          
          data = responseData;
        }

        setRecipes(data.recipes || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 0);
        setHasNextPage(data.hasNextPage || false);
        setHasPrevPage(data.hasPrevPage || false);
      } catch (error) {
        console.error("레시피 조회 오류:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("에러 상세:", errorMessage);
        setRecipes([]);
        setCurrentPage(1);
        setTotalPages(0);
        setHasNextPage(false);
        setHasPrevPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      router.push(`/menu?q=${encodeURIComponent(query)}&page=1`);
    } else {
      router.push("/menu?page=1");
    }
  };

  const handleSearchClear = () => {
    setSearchInput("");
    router.push("/menu?page=1");
  };

  return (
    <SmoothScroll>
      <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
        <GrainOverlay />
        <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <header className="mb-12 sm:mb-16 lg:mb-20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight tracking-tight font-serif font-bold text-gray-900 dark:text-white">
                오늘의메뉴
              </h1>
              
              {/* 검색 기능 */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial sm:min-w-[300px]">
                  <Search 
                    size={20} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="메뉴 검색..."
                    className="
                      w-full pl-10 pr-10 py-2.5
                      bg-white dark:bg-gray-800
                      text-gray-900 dark:text-gray-100
                      border border-gray-300 dark:border-gray-600
                      rounded-lg
                      focus:outline-none
                      focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400
                      placeholder:text-gray-400 dark:placeholder:text-gray-500
                      transition-colors duration-150
                    "
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-600
                        dark:text-gray-500 dark:hover:text-gray-300
                        transition-colors duration-150
                      "
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="
                    px-4 py-2.5
                    bg-emerald-500 hover:bg-emerald-600
                    dark:bg-emerald-600 dark:hover:bg-emerald-500
                    text-white font-medium
                    rounded-lg
                    shadow-sm hover:shadow-md
                    transition-all duration-300
                    whitespace-nowrap
                  "
                >
                  검색
                </button>
              </form>
            </div>
            
            {searchQuery && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                검색 결과: &quot;{searchQuery}&quot; ({recipes.length}개)
              </p>
            )}
          </header>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-white/50 text-lg">
                로딩 중...
              </p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-white/50 text-lg mb-4">
                {searchQuery ? "검색 결과가 없습니다." : "게시글이 없습니다."}
              </p>
              {!searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  환경 변수(NOTION_RECIPE_API_KEY, NOTION_RECIPE_DATABASE_ID)가 설정되어 있는지 확인해주세요.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-[minmax(320px,auto)]">
                {recipes.map((recipe, index) => {
                  const isLarge = index % 4 === 0;
                  const isWide = index % 4 === 2;

                  return (
                    <div
                      key={recipe.id}
                      className={`
                        ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
                        ${isWide ? "md:col-span-2" : ""}
                      `}
                    >
                      <MenuCard recipe={recipe} index={index} isLarge={isLarge} />
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={searchQuery ? `/menu?q=${encodeURIComponent(searchQuery)}` : "/menu"}
                hasNextPage={hasNextPage}
                hasPrevPage={hasPrevPage}
              />
            </>
          )}
        </main>
      </div>
    </SmoothScroll>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <SmoothScroll>
        <div className="blog-page min-h-screen bg-gray-50 dark:bg-gray-900">
          <GrainOverlay />
          <main className="min-h-screen pt-16 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20">
              <p className="text-gray-600 dark:text-white/50 text-lg">
                로딩 중...
              </p>
            </div>
          </main>
        </div>
      </SmoothScroll>
    }>
      <MenuPageContent />
    </Suspense>
  );
}

