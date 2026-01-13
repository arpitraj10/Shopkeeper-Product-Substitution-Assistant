for collections import deque
    
def find_substitutes(kg, query_product, max_price, req_attrs, req_brand):
    G = kg.graph

    if query_product not in G:
        return [], "Product not found"
    
    results = []
    q_cat = next(G.successors(query_product))

    #BFS over category + similar categories
    categories = [q_cat] + list(G.successors(q_cat))

    for node, data in G.nodes(data=True):
        if data.get("type") != "product" or node == query_product:
            continue

        prod_cat = next(G.successors(node))
        prod = G.nodes[node]

        #Stock + price
        if prod["stock"] <= 0 or prod["price"] > max_price:
            continue

        #Category constraint
        if prod_cat not in categories:
            continue

        #Attribute constraint
        if not set(req_attrs).issubset(set(prod["attributes"])):
            continue

        score = 0
        explanation = []

        if prod_cat == q_cat:
            score += 2
            explanation.append("same_category")
        else:
            score += 1
            explanation.append("related_category")

        if req_brand and prod["brand"] == req_brand:
            score += 1
            explanation.append("same brand")

        if prod["price"] < G.nodes[query_product]["price"]:
            explanation.append("cheaper_option")

        explanation.append("all_required_tags_matched")

        results.append((score, prod, explanation))

    results.sort(key=lambda x: -x[0])
    return results[:3], None        


    