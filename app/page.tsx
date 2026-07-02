"use client";

import { useEffect, useState } from "react";
import type { Product, SubstituteResponse } from "@/lib/types";

const TAG_OPTIONS = [
  { value: "veg", label: "Veg" },
  { value: "lactose_free", label: "Lactose-free" },
  { value: "sugar_free", label: "Sugar-free" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(50);
  const [tags, setTags] = useState<string[]>([]);
  const [brand, setBrand] = useState("");

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SubstituteResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products);
        if (data.products.length > 0) setProductId(data.products[0].id);
      })
      .catch(() => setRequestError("Could not load the shelf list."));
  }, []);

  function toggleTag(value: string) {
    setTags((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function checkShelf() {
    if (!productId) return;
    setLoading(true);
    setRequestError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/substitutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          maxPrice,
          requiredTags: tags,
          brand: brand.trim() || undefined,
        }),
      });
      const data: SubstituteResponse = await res.json();
      setResponse(data);
    } catch {
      setRequestError("The counter couldn't reach the ledger. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {/* Hero */}
        <header className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-shop-green">
            Ledger No. 01 &middot; Substitution Desk
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Out of stock?
            <br />
            The ledger knows what&apos;s close.
          </h1>
          <p className="mt-4 max-w-xl font-body text-ink/70">
            Tell the counter what was asked for. If the shelf is empty,
            we&apos;ll trace the category and brand relations to find the
            nearest match &mdash; and show our working.
          </p>
        </header>

        {/* Counter / form */}
        <section className="rounded-lg border border-line bg-paper/60 p-6 shadow-[0_1px_0_0_#D9CFB8] sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
                Item requested
              </span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="rounded-md border border-line bg-white px-3 py-2 font-body text-ink focus:border-shop-green focus:outline-none focus:ring-2 focus:ring-shop-green/30"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
                Budget ceiling (₹)
              </span>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="rounded-md border border-line bg-white px-3 py-2 font-mono text-ink focus:border-shop-green focus:outline-none focus:ring-2 focus:ring-shop-green/30"
              />
            </label>

            <fieldset className="flex flex-col gap-2 sm:col-span-2">
              <legend className="font-mono text-xs uppercase tracking-wide text-ink/60">
                Must have
              </legend>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((opt) => {
                  const active = tags.includes(opt.value);
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => toggleTag(opt.value)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1.5 font-body text-sm transition-colors ${
                        active
                          ? "border-shop-green bg-shop-green text-paper"
                          : "border-line bg-white text-ink/70 hover:border-shop-green/60"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="font-mono text-xs uppercase tracking-wide text-ink/60">
                Preferred brand (optional)
              </span>
              <input
                type="text"
                placeholder="e.g. Amul"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-md border border-line bg-white px-3 py-2 font-body text-ink focus:border-shop-green focus:outline-none focus:ring-2 focus:ring-shop-green/30"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={checkShelf}
            disabled={loading || !productId}
            className="mt-6 w-full rounded-md bg-ink px-4 py-3 font-display text-lg font-semibold tracking-wide text-paper transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Checking the shelf…" : "Check the shelf"}
          </button>
        </section>

        {/* Results */}
        <section className="mt-10">
          {requestError && (
            <div className="rounded-md border border-brick/40 bg-brick/5 px-4 py-3 font-body text-brick">
              {requestError}
            </div>
          )}

          {response?.exactMatch && (
            <ResultStamp tone="green" label="In stock">
              <ProductCard product={response.exactMatch} explanation={[]} />
            </ResultStamp>
          )}

          {response && !response.exactMatch && response.error && (
            <ResultStamp tone="brick" label="Nothing found">
              <p className="font-body text-ink/70">
                No product in stock matches those constraints. Try raising the
                budget ceiling or removing a required tag.
              </p>
            </ResultStamp>
          )}

          {response &&
            !response.exactMatch &&
            !response.error &&
            response.results.length === 0 && (
              <ResultStamp tone="brick" label="Nothing found">
                <p className="font-body text-ink/70">
                  Nothing on the shelf matches right now. Try raising the
                  budget ceiling, dropping a required tag, or clearing the
                  brand preference.
                </p>
              </ResultStamp>
            )}

          {response && !response.exactMatch && response.results.length > 0 && (
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink/60">
                {response.results.length} substitute
                {response.results.length > 1 ? "s" : ""} found
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {response.results.map((r) => (
                  <ProductCard
                    key={r.product.id}
                    product={r.product}
                    explanation={r.explanation}
                    score={r.score}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-line pt-6 font-mono text-xs text-ink/50">
          Rule-based substitution &middot; category &amp; brand relations
          traced from the product ledger
        </footer>
      </div>
    </main>
  );
}

function ResultStamp({
  tone,
  label,
  children,
}: {
  tone: "green" | "brick";
  label: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "green" ? "text-shop-green" : "text-brick";
  return (
    <div className="fade-in">
      <span
        className={`stamp inline-block px-3 py-1 font-mono text-xs font-semibold uppercase ${toneClass}`}
      >
        {label}
      </span>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ProductCard({
  product,
  explanation,
  score,
}: {
  product: Product;
  explanation: string[];
  score?: number;
}) {
  return (
    <div className="price-tag fade-in border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-ink">
          {product.name}
        </h3>
        {typeof score === "number" && (
          <span className="rounded bg-turmeric/20 px-2 py-0.5 font-mono text-xs text-ink/70">
            score {score}
          </span>
        )}
      </div>
      <p className="mt-1 font-mono text-2xl text-shop-green">
        ₹{product.price}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 font-body text-sm text-ink/70">
        <dt className="text-ink/50">Brand</dt>
        <dd>{product.brand}</dd>
        <dt className="text-ink/50">Category</dt>
        <dd>{product.category}</dd>
        <dt className="text-ink/50">In stock</dt>
        <dd>{product.stock}</dd>
        {product.attributes?.length > 0 && (
          <>
            <dt className="text-ink/50">Tags</dt>
            <dd>{product.attributes.join(", ")}</dd>
          </>
        )}
      </dl>

      {explanation.length > 0 && (
        <div className="mt-4 border-t border-dashed border-line pt-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink/40">
            Why this match
          </p>
          <ul className="mt-1 space-y-0.5 font-body text-sm text-ink/70">
            {explanation.map((e) => (
              <li key={e}>&middot; {e.replaceAll("_", " ")}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
