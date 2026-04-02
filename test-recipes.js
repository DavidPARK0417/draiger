import "dotenv/config";
import { getLatestRecipes } from "./src/lib/notion-recipe.js";

async function test() {
  console.log("Fetching latest recipes...");
  const recipes = await getLatestRecipes(3);
  console.log(JSON.stringify(recipes, null, 2));
}

test().catch(console.error);
