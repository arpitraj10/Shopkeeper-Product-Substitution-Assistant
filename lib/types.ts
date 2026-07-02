export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  attributes: string[];
}

export interface ProductData {
  products: Product[];
  category_similarity: Record<string, string[]>;
}

export interface SubstituteResult {
  score: number;
  product: Product;
  explanation: string[];
}

export interface SubstituteRequest {
  productId: string;
  maxPrice: number;
  requiredTags: string[];
  brand?: string;
}

export interface SubstituteResponse {
  exactMatch: Product | null;
  results: SubstituteResult[];
  error: string | null;
}
