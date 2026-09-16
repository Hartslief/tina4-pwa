from tina4_python.core.router import get, post, put, delete
from tina4_python.swagger import description, tags
from src.orm.Product import Product


@description("List all products")
@tags(["products"])
@get("/api/products")
async def list_products(request, response):
    """List all products with pagination."""
    page = int(request.query.get("page", 1))
    per_page = int(request.query.get("per_page", 20))
    offset = (page - 1) * per_page
    records = Product.where("1=1", limit=per_page, offset=offset)
    # tina4:edit  customise the list projection (filters, ordering, fields)
    # records.to_paginate() -> records, total, page, per_page, total_pages, limit, offset
    return response(records.to_paginate())


@description("Get a product by ID")
@tags(["products"])
@get("/api/products/{id:int}")
async def get_product(request, response):
    """Get a single product by ID."""
    product = Product.find_by_id(request.params["id"])
    if product is None:
        return response({"error": "Not found"}, 404)
    return response(product.to_dict())


@description("Create a new product")
@tags(["products"])
@post("/api/products")
async def create_product(request, response):
    """Create a new product. Secure-by-default: requires a Bearer token (use --public to open)."""
    # ─── EXTEND: validate / business rules before persist ───────
    # e.g. reject invalid input; ground: tina4_context("validate before create", "python")
    item = Product.create(request.body)
    if item is False:
        return response({"error": "Could not create product"}, 400)
    return response(item.to_dict(), 201)


@description("Update a product")
@tags(["products"])
@put("/api/products/{id:int}")
async def update_product(request, response):
    """Update a product by ID. Secure-by-default: requires a Bearer token (use --public to open)."""
    item = Product.find_by_id(request.params["id"])
    if item is None:
        return response({"error": "Not found"}, 404)
    # ─── EXTEND: guard which fields / who may update ────────────
    # e.g. enforce ownership; ground: tina4_context("authorize update", "python")
    for key, value in request.body.items():
        if hasattr(item, key) and key != "id":
            setattr(item, key, value)
    if item.save() is False:
        return response({"error": "Could not update product"}, 400)
    return response(item.to_dict())


@description("Delete a product")
@tags(["products"])
@delete("/api/products/{id:int}")
async def delete_product(request, response):
    """Delete a product by ID. Secure-by-default: requires a Bearer token (use --public to open)."""
    item = Product.find_by_id(request.params["id"])
    if item is None:
        return response({"error": "Not found"}, 404)
    item.delete()
    return response(None, 204)
