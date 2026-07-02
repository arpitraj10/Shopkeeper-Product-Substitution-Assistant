import fs from "fs";
import path from "path";
import type { Product, ProductData } from "./types";

/**
 * KnowledgeGraph holds products plus the relations described in the README:
 *   IS_A          (Product -> Category)
 *   HAS_ATTRIBUTE (Product -> Attribute)
 *   HAS_BRAND     (Product -> Brand)
 *   SIMILAR_TO    (Category -> Category)
 *
 * It's a lightweight in-memory index (no external graph library needed),
 * loaded once per server instance and cached.
 */
export class KnowledgeGraph {
  productsById: Map<string, Product> = new Map();
  productsByCategory: Map<string, Product[]> = new Map();
  categorySimilarity: Map<string, string[]> = new Map();

  constructor(data: ProductData) {
    for (const product of data.products) {
      this.productsById.set(product.id, product);

      const bucket = this.productsByCategory.get(product.category) ?? [];
      bucket.push(product);
      this.productsByCategory.set(product.category, bucket);
    }

    for (const [category, similar] of Object.entries(
      data.category_similarity ?? {}
    )) {
      this.categorySimilarity.set(category, similar);
    }
  }

  getProduct(id: string): Product | undefined {
    return this.productsById.get(id);
  }

  /** Category node plus every category linked to it via SIMILAR_TO. */
  relatedCategories(category: string): string[] {
    return [category, ...(this.categorySimilarity.get(category) ?? [])];
  }

  allProducts(): Product[] {
    return Array.from(this.productsById.values());
  }
}

let cached: KnowledgeGraph | null = null;

export function loadKnowledgeGraph(): KnowledgeGraph {
  if (cached) return cached;

  const dataPath = path.join(process.cwd(), "data", "products.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data: ProductData = JSON.parse(raw);

  cached = new KnowledgeGraph(data);
  return cached;
}
