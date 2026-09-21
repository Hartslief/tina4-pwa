from tina4_python.core.router import get, post, put, delete
from tina4_python.swagger import description, tags, example, example_response
from src.orm.Product import Product


@get("/api/products")
@description("List all products")
@tags(["products"])
@example_response(200, {
    "records": [
        {
            "id": 1,
            "name": "Laptop",
            "description": "15-inch laptop",
            "price": 15000,
            "in_stock": True
        },
        {
            "id": 2,
            "name": "Keyboard",
            "description": "Mechanical keyboard",
            "price": 1299.99,
            "in_stock": True
        }
    ],
    "total": 2,
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "limit": 20,
    "offset": 0
})
async def list_products(request, response):
    """
    List all products with pagination.
    """

    # Read the requested page number from the query string.
    page = int(request.query.get("page", 1))

    # Determine how many products should be returned per page.
    per_page = int(request.query.get("per_page", 20))

    # Convert the page number into a database offset. 
    # Page 1 -> offset 0 
    # Page 2 -> offset 10 
    # Page 3 -> offset 20
    offset = (page - 1) * per_page

    # Retrieve only the records needed for the requested page.
    records = Product.where("1=1", limit=per_page, offset=offset)
    # tina4:edit  customise the list projection (filters, ordering, fields)
    # records.to_paginate() -> records, total, page, per_page, total_pages, limit, offset
    return response(records.to_paginate())


@get("/api/products/{id:int}")
@description("Get a product by ID")
@tags(["products"])
@example_response(200, {
    "id": 1,
    "name": "Laptop",
    "description": "15-inch laptop",
    "price": 15000,
    "in_stock": True
})
@example_response(404, {
    "error": "Not found"
})
async def get_product(request, response):
    """
    Get a single product by ID.
    """

    # Find the product using the ID supplied in the URL.
    product = Product.find_by_id(request.params["id"])

    # Return 404 when the product does not exist.
    if product is None:
        return response({"error": "Not found"}, 404)
    
    # Convert the ORM object to a JSON-friendly dictionary.
    return response(product.to_dict())


@post("/api/products")
@description("Create a new product")
@tags(["products"])
@example({
    "name": "Wireless Mouse",
    "description": "Wireless computer mouse",
    "price": 599.99,
    "in_stock": True
})
@example_response(201, {
    "id": 11,
    "name": "Wireless Mouse",
    "description": "Wireless computer mouse",
    "price": 599.99,
    "in_stock": True
})
@example_response(400, {
    "error": "Could not create product"
})
async def create_product(request, response):
    """
    Create a new product. Secure-by-default: 
    requires a Bearer token (use --public to open).
    """
    # ─── EXTEND: validate / business rules before persist ───────
    # e.g. reject invalid input; ground: tina4_context("validate before create", "python")
    # Create a Product directly from the request body.
    item = Product.create(request.body)

    # Return a bad request if the product could not be created.
    if item is False:
        return response({"error": "Could not create product"}, 400)

    # HTTP 201 indicates that the resource was successfully created.
    return response(item.to_dict(), 201)


@put("/api/products/{id:int}")
@description("Update a product")
@tags(["products"])
@example({
    "name": "Updated Wireless Mouse",
    "description": "Updated wireless mouse",
    "price": 649.99,
    "in_stock": True
})
@example_response(200, {
    "id": 11,
    "name": "Updated Wireless Mouse",
    "description": "Updated wireless mouse",
    "price": 649.99,
    "in_stock": True
})
@example_response(404, {
    "error": "Not found"
})
@example_response(400, {
    "error": "Could not update product"
})
async def update_product(request, response):
    """
    Update a product by ID. Secure-by-default: 
    requires a Bearer token (use --public to open).
    """

    # Find the product being updated.
    item = Product.find_by_id(request.params["id"])

    # Return 404 if it does not exist.
    if item is None:
        return response({"error": "Not found"}, 404)
    # ─── EXTEND: guard which fields / who may update ────────────
    # e.g. enforce ownership; ground: tina4_context("authorize update", "python")

    # Apply each field supplied by the client. 
    # hasattr() ensures that only fields that actually exist on the 
    # ORM object are considered. 
    # The ID is explicitly excluded so that clients cannot change 
    # the primary key through this endpoint.
    for key, value in request.body.items():
        if hasattr(item, key) and key != "id":
            setattr(item, key, value)

    # Persist the updated product.
    if item.save() is False:
        return response({"error": "Could not update product"}, 400)

    # Return the updated product.
    return response(item.to_dict())


@delete("/api/products/{id:int}")
@description("Delete a product")
@tags(["products"])
@example_response(204, None)
@example_response(404, {
    "error": "Not found"
})
async def delete_product(request, response):
    """
    Delete a product by ID. Secure-by-default: 
    requires a Bearer token (use --public to open).
    """

    # Find the product that should be deleted.
    item = Product.find_by_id(request.params["id"])

    # Return 404 when it does not exist.
    if item is None:
        return response({"error": "Not found"}, 404)

    # Delete the ORM object from the database.
    item.delete()

    # A successful DELETE returns no response body.
    return response(None, 204)
