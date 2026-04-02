import { config } from "dotenv";
config({ path: ".env.local" });
import { getLatestRecipes } from "./src/lib/notion-recipe";

async function test() {
  console.log("Fetching latest recipes...");
  const recipes = await getLatestRecipes(3);
  console.log(
    JSON.stringify(
      recipes.map((r) => ({ title: r.title, featuredImage: r.featuredImage })),
      null,
      2,
    ),
  );
}

test().catch(console.error);
