import { NextRequest, NextResponse } from "next/server";
import { loadKnowledgeGraph } from "@/lib/kg";
import { findSubstitutes, isExactMatchAvailable } from "@/lib/reasoning";
import type { SubstituteRequest, SubstituteResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: SubstituteRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { exactMatch: null, results: [], error: "Invalid request body" } as SubstituteResponse,
      { status: 400 }
    );
  }

  const { productId, maxPrice, requiredTags, brand } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json(
      { exactMatch: null, results: [], error: "productId is required" } as SubstituteResponse,
      { status: 400 }
    );
  }

  const kg = loadKnowledgeGraph();

  const exactMatch = isExactMatchAvailable(kg, productId);
  if (exactMatch) {
    const response: SubstituteResponse = {
      exactMatch,
      results: [],
      error: null,
    };
    return NextResponse.json(response);
  }

  const { results, error } = findSubstitutes(
    kg,
    productId,
    typeof maxPrice === "number" ? maxPrice : Number(maxPrice) || 0,
    Array.isArray(requiredTags) ? requiredTags : [],
    brand || null
  );

  const response: SubstituteResponse = {
    exactMatch: null,
    results,
    error,
  };

  return NextResponse.json(response, { status: error ? 404 : 200 });
}
