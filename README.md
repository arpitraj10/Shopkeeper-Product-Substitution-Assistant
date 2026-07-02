# Shopkeeper Product Substitution Assistant

A small full-stack app for a shop counter: type in what a customer asked
for, and if it's out of stock, the app traces a lightweight knowledge
graph (category, brand, and attribute relations) to suggest the closest
in-stock substitutes, with an explanation for each suggestion.

This is a **single Next.js app** — the React frontend and the API
(backend) live in the same project and deploy together as one Vercel
project. There is no separate backend service to host.

---

## Why this differs from the original Streamlit prototype

The uploaded prototype (`app.py` / `kg.py` / `reasoning.py`, Streamlit +
networkx) doesn't fit Vercel's model: Streamlit needs a long-running
Python server, which Vercel's serverless platform doesn't run. This
rewrite keeps the same **knowledge graph design and rule-based
reasoning** described in the original README, reimplemented as:

- `lib/kg.ts` — loads `data/products.json` into an in-memory graph
  (`IS_A`, `HAS_BRAND`, `HAS_ATTRIBUTE`, `SIMILAR_TO` relations)
- `lib/reasoning.ts` — the same scoring rules (`same_category`,
  `related_category`, `same_brand`, `cheaper_option`,
  `all_required_tags_matched`)
- `app/api/*/route.ts` — Next.js Route Handlers exposing this logic as
  a JSON API (this is the "backend")
- `app/page.tsx` — the customer-facing counter UI (this is the
  "frontend")

Bugs fixed from the original code along the way:
- `products.json` is now consistently read as `{ products, category_similarity }`
  (the original `kg.py` assumed a bare list, which didn't match the
  uploaded `products.json`).
- `category_similarity` from the data file is now actually used to
  build `SIMILAR_TO` relations (previously loaded but never wired up).
- `app.py` referenced `prod["names"]`, which isn't a field on any
  product — fixed to the actual `name` field.

---

## Project structure

```
shopkeeper-app/
├── app/
│   ├── api/
│   │   ├── products/route.ts       # GET  /api/products
│   │   └── substitutes/route.ts    # POST /api/substitutes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # counter UI
├── data/
│   └── products.json               # product catalog + category_similarity
├── lib/
│   ├── kg.ts                       # knowledge graph loader
│   ├── reasoning.ts                # substitution rules / scoring
│   └── types.ts
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Knowledge graph design

**Nodes:** Product, Category, Brand, Attribute

**Edges:**
- `IS_A` (Product → Category)
- `HAS_ATTRIBUTE` (Product → Attribute)
- `HAS_BRAND` (Product → Brand)
- `SIMILAR_TO` (Category → Category), from `category_similarity` in
  `products.json`

**Search:** for a requested product, collect its category plus every
category it's `SIMILAR_TO`, then filter candidate products by stock,
price, category membership, and required attribute tags.

**Explanation rules:** `same_category`, `related_category`,
`same_brand`, `cheaper_option`, `all_required_tags_matched`.

---

## API

### `GET /api/products`
Returns the full catalog (used to populate the item selector).

```json
{ "products": [ { "id": "milk_nandini", "name": "Nandini Milk", ... } ] }
```

### `POST /api/substitutes`
```json
{
  "productId": "milk_amul",
  "maxPrice": 50,
  "requiredTags": ["veg"],
  "brand": "Amul"
}
```

Response:
```json
{
  "exactMatch": null,
  "results": [
    {
      "score": 3,
      "product": { "id": "curd_amul", "name": "Amul Curd", ... },
      "explanation": ["related_category", "same_brand", "all_required_tags_matched"]
    }
  ],
  "error": null
}
```

If the requested product is in stock, `exactMatch` is populated and
`results` is empty.

---

## Local development

Requires Node.js 18.18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing the catalog

Edit `data/products.json`. Each product needs `id`, `name`, `category`,
`brand`, `price`, `stock`, `attributes`. Add category relationships
under `category_similarity` (an array of related category names per
category).

---

## Deploying to Vercel (frontend + backend together)

No separate backend hosting is needed — Vercel builds the whole Next.js
app, serving `app/page.tsx` as the frontend and every `app/api/**/route.ts`
as serverless functions.

1. Push this project to a GitHub repository.
2. In the [Vercel dashboard](https://vercel.com/new), import that
   repository.
3. Framework preset: **Next.js** (auto-detected). No environment
   variables are required for the default setup.
4. Deploy. Vercel will build with `npm run build` and serve both the UI
   and the `/api/*` routes from the same deployment URL.

Or via the CLI:

```bash
npm install -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

Every subsequent push to the connected branch redeploys automatically.

---

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router) — frontend + API routes
- React 18
- TypeScript
- Tailwind CSS

## Main URL for APP
URL : https://shopkeeper-product-substitution-ass.vercel.app/
