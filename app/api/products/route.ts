import { NextResponse } from "next/server";
import { loadKnowledgeGraph } from "@/lib/kg";

export async function GET() {
  const kg = loadKnowledgeGraph();
  const products = kg.allProducts().sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ products });
}
