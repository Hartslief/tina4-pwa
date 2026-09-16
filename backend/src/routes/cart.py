from tina4_python.core.router import get, post, delete
from tina4_python.swagger import description, tags
from tina4_python.auth import Auth

from src.orm.Cart import Cart
from src.orm.CartItem import CartItem
from src.orm.Product import Product


def get_authenticated_user(request, response):
    """Get the authenticated user's ID from the JWT token."""

    auth_header = request.headers.get("authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""
    payload = Auth.valid_token_static(token) if token else None

    if not payload:
        return response({"error": "Unauthorized"}, 401)

    user_id = payload.get("user_id")


@description("Get the current user's shopping cart")
@tags(["cart"])
@get("/api/cart")
async def get_cart(request, response):
    """Get the authenticated user's active shopping cart."""

    user_id = get_authenticated_user(request)

    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    carts = Cart.where(
        "user_id = ? AND status = ?",
        [user_id, "active"],
        limit=1
    )

    if len(carts) == 0:
        return response({
            "items": [],
            "total": 0
        })

    cart = carts[0]

    items = CartItem.where(
        "cart_id = ?",
        [cart.id]
    )

    cart_items = []
    total = 0

    for item in items:
        product = Product.find_by_id(item.product_id)

        if product is None:
            continue

        item_total = float(product.price) * item.quantity
        total += item_total

        cart_items.append({
            "id": item.id,
            "product_id": product.id,
            "product_name": product.name,
            "price": float(product.price),
            "quantity": item.quantity,
            "item_total": item_total
        })

    return response({
        "id": cart.id,
        "status": cart.status,
        "items": cart_items,
        "total": total
    })


@description("Add a product to the current user's shopping cart")
@tags(["cart"])
@post("/api/cart/items")
async def add_cart_item(request, response):
    """Add a product to the authenticated user's shopping cart."""

    user_id = get_authenticated_user(request)

    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    product_id = request.body.get("product_id")
    quantity = request.body.get("quantity", 1)

    if not product_id:
        return response({
            "error": "product_id is required"
        }, 400)

    if quantity < 1:
        return response({
            "error": "quantity must be at least 1"
        }, 400)

    product = Product.find_by_id(product_id)

    if product is None:
        return response({
            "error": "Product not found"
        }, 404)

    if not product.in_stock:
        return response({
            "error": "Product is out of stock"
        }, 400)

    carts = Cart.where(
        "user_id = ? AND status = ?",
        [user_id, "active"],
        limit=1
    )

    if len(carts) > 0:
        cart = carts[0]
    else:
        cart = Cart.create({
            "user_id": user_id,
            "status": "active"
        })

    existing_items = CartItem.where(
        "cart_id = ? AND product_id = ?",
        [cart.id, product_id],
        limit=1
    )

    if len(existing_items) > 0:
        item = existing_items[0]
        item.quantity += quantity

        if item.save() is False:
            return response({
                "error": "Could not update cart item"
            }, 400)
    else:
        item = CartItem.create({
            "cart_id": cart.id,
            "product_id": product_id,
            "quantity": quantity
        })

        if item is False:
            return response({
                "error": "Could not add item to cart"
            }, 400)

    return response({
        "message": "Product added to cart",
        "item": item.to_dict()
    }, 201)


@description("Remove an item from the current user's shopping cart")
@tags(["cart"])
@delete("/api/cart/items/{id:int}")
async def remove_cart_item(request, response):
    """Remove an item from the authenticated user's shopping cart."""

    user_id = get_authenticated_user(request)

    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    item = CartItem.find_by_id(request.params["id"])

    if item is None:
        return response({
            "error": "Cart item not found"
        }, 404)

    cart = Cart.find_by_id(item.cart_id)

    if cart is None or cart.user_id != user_id:
        return response({
            "error": "Cart item not found"
        }, 404)

    item.delete()

    return response(None, 204)