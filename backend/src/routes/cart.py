from tina4_python.core.router import get, post, delete
from tina4_python.swagger import description, tags, example, example_response
from tina4_python.auth import Auth

from src.orm.Cart import Cart
from src.orm.CartItem import CartItem
from src.orm.Product import Product


def get_authenticated_user(request):
    """ 
    Extract the authenticated user's ID from the JWT. 
    Returning None means that the request does not contain a valid authentication token. 
    """

    # Get the Authorization header.
    auth_header = request.headers.get("authorization", "")

    # The application expects the standard Bearer token format.
    if not auth_header.startswith("Bearer "):
        return None

    # Remove "Bearer " from the beginning of the header.
    token = auth_header[7:]

    # Validate the JWT and decode its payload.
    payload = Auth.valid_token_static(token)

    if not payload:
        return None

    # The login endpoint placed user_id inside the token.
    return payload.get("user_id")


@get("/api/cart")
@description("Get the current user's shopping cart")
@tags(["cart"])
@example_response(200, {
    "id": 1,
    "status": "active",
    "items": [
        {
            "id": 1,
            "product_id": 3,
            "product_name": "Mechanical Keyboard",
            "price": 1299.99,
            "quantity": 2,
            "item_total": 2599.98
        }
    ],
    "total": 2599.98
})
@example_response(401, {
    "error": "Unauthorized"
})
async def get_cart(request, response):
    """
    Get the authenticated user's active shopping cart.
    """

    # Determine which user owns the cart.
    user_id = get_authenticated_user(request)

    # A cart belongs to a user, so unauthenticated requests are rejected.
    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    # Find the user's active cart. 
    # There should only be one active cart at a time.
    carts = Cart.where(
        "user_id = ? AND status = ?",
        [user_id, "active"],
        limit=1
    )

    # If the user does not have a cart yet, return an empty cart structure.
    if len(carts) == 0:
        return response({
            "items": [],
            "total": 0
        })

    cart = carts[0]

    # Retrieve all items belonging to this cart.
    items = CartItem.where(
        "cart_id = ?",
        [cart.id]
    )

    cart_items = []
    total = 0

    # Build the response using both the cart item and product information.
    for item in items:
        product = Product.find_by_id(item.product_id)

        # Skip cart items whose product no longer exists.
        if product is None:
            continue

        # Calculate the total price for this individual cart item.
        item_total = float(product.price) * item.quantity

        # Add the item total to the overall cart total.
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


@post("/api/cart/items")
@description("Add a product to the current user's shopping cart")
@tags(["cart"])
@example({
    "product_id": 3,
    "quantity": 2
})
@example_response(201, {
    "message": "Product added to cart",
    "item": {
        "id": 1,
        "cart_id": 1,
        "product_id": 3,
        "quantity": 2
    }
})
@example_response(400, {
    "error": "Product is out of stock"
})
@example_response(404, {
    "error": "Product not found"
})
@example_response(401, {
    "error": "Unauthorized"
})
async def add_cart_item(request, response):
    """
    Add a product to the authenticated user's shopping cart.
    """

    # Identify the user making the request.
    user_id = get_authenticated_user(request)

    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    # Read the product and requested quantity.
    product_id = request.body.get("product_id")
    quantity = request.body.get("quantity", 1)

    # A product ID is required to know what should be added.
    if not product_id:
        return response({
            "error": "product_id is required"
        }, 400)

    # Prevent zero or negative quantities.
    if quantity < 1:
        return response({
            "error": "quantity must be at least 1"
        }, 400)

    # Make sure the requested product actually exists.
    product = Product.find_by_id(product_id)
    
    if product is None:
        return response({
            "error": "Product not found"
        }, 404)

    # Customers should not be able to add unavailable products.
    if not product.in_stock:
        return response({
            "error": "Product is out of stock"
        }, 400)

    # Find the user's existing active cart.
    carts = Cart.where(
        "user_id = ? AND status = ?",
        [user_id, "active"],
        limit=1
    )

    if len(carts) > 0:
        # Reuse the existing active cart.
        cart = carts[0]
    else:  
        # Create an active cart when this is the user's first item.
        cart = Cart.create({
            "user_id": user_id,
            "status": "active"
        })

    # Check whether this product is already in the cart.
    existing_items = CartItem.where(
        "cart_id = ? AND product_id = ?",
        [cart.id, product_id],
        limit=1
    )

    if len(existing_items) > 0:
        # Instead of creating a duplicate row, increase the quantity 
        # of the existing cart item.
        item = existing_items[0]
        item.quantity += quantity

        if item.save() is False:
            return response({
                "error": "Could not update cart item"
            }, 400)
    else:
        # Create a new cart item when the product is not already present.
        item = CartItem.create({
            "cart_id": cart.id,
            "product_id": product_id,
            "quantity": quantity
        })

        if item is False:
            return response({
                "error": "Could not add item to cart"
            }, 400)

    # Return the newly created or updated cart item.
    return response({
        "message": "Product added to cart",
        "item": item.to_dict()
    }, 201)


@delete("/api/cart/items/{id:int}")
@description("Remove an item from the current user's shopping cart")
@tags(["cart"])
@example_response(204, None)
@example_response(401, {
    "error": "Unauthorized"
})
@example_response(404, {
    "error": "Cart item not found"
})
async def remove_cart_item(request, response):
    """
    Remove an item from the authenticated user's shopping cart.
    """

    # Identify the currently authenticated user.
    user_id = get_authenticated_user(request)

    if user_id is None:
        return response({
            "error": "Unauthorized"
        }, 401)

    # Find the requested cart item.
    item = CartItem.find_by_id(request.params["id"])

    if item is None:
        return response({
            "error": "Cart item not found"
        }, 404)

    # Load the cart that owns this item.
    cart = Cart.find_by_id(item.cart_id)

    # Important security check: 
    # A user must not be able to delete another user's cart item simply 
    # by knowing its ID.
    if cart is None or cart.user_id != user_id:
        return response({
            "error": "Cart item not found"
        }, 404)

    # Delete the cart item.
    item.delete()

    return response(None, 204)