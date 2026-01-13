# Shopkeeper-Product-Substitution-Assistant
Knowledge Graph Design

Nodes: Product, Category, Brand, Attribute

Edges:

IS_A (Product → Category)

HAS_ATTRIBUTE (Product → Attribute)

HAS_BRAND (Product → Brand)

SIMILAR_TO (Category → Category)

Search Method

BFS-style exploration via category and similar categories

Rule-based filtering (price, stock, attributes)

Explanation Rules

same_category

related_category

same_brand

cheaper_option

all_required_tags_matched

Run Locally:

