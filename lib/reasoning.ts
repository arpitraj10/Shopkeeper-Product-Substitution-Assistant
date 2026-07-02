import type { KnowledgeGraph } from "./kg";
import type { Product, SubstituteResult } from "./types";

/**
 * Finds up to 3 substitute products for `queryProductId`, ranked by score.
 *
 * Rules applied (in order):
 *  - must be in stock
 *  - price <= maxPrice
 *  - category must equal the query's category or be SIMILAR_TO it
 *  - must contain every tag in requiredTags
 *
 * Scoring / explanation:
 *  - same_category            (+2)
 *  - related_category         (+1)
 *  - same_brand (if requested) (+1)
 *  - all_required_tags_matched (informational, always true for included results)
 */
export function findSubstitutes(
  kg: KnowledgeGraph,
  queryProductId: string,
  maxPrice: number,
  requiredTags: string[],
  requiredBrand?: string | null
): { results: SubstituteResult[]; error: string | null } {
  const queryProduct = kg.getProduct(queryProductId);
  if (!queryProduct) {
    return { results: [], error: "Product not found" };
  }

  const candidateCategories = new Set(
    kg.relatedCategories(queryProduct.category)
  );

  const results: SubstituteResult[] = [];

  for (const product of kg.allProducts()) {
    if (product.id === queryProductId) continue;
    if (product.stock <= 0) continue;
    if (product.price > maxPrice) continue;
    if (!candidateCategories.has(product.category)) continue;

    const attrs = new Set(product.attributes ?? []);
    if (!requiredTags.every((tag) => attrs.has(tag))) continue;

    let score = 0;
    const explanation: string[] = [];

    if (product.category === queryProduct.category) {
      score += 2;
      explanation.push("same_category");
    } else {
      score += 1;
      explanation.push("related_category");
    }

    if (requiredBrand && product.brand === requiredBrand) {
      score += 1;
      explanation.push("same_brand");
    }

    if (product.price < queryProduct.price) {
      explanation.push("cheaper_option");
    }

    if (requiredTags.length > 0) {
      explanation.push("all_required_tags_matched");
    }

    results.push({ score, product, explanation });
  }

  results.sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  return { results: results.slice(0, 3), error: null };
}

export function isExactMatchAvailable(
  kg: KnowledgeGraph,
  productId: string
): Product | null {
  const product = kg.getProduct(productId);
  if (product && product.stock > 0) return product;
  return null;
}
