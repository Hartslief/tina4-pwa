from tina4_python.core.router import post
from tina4_python.swagger import description, tags, example, example_response
from tina4_python.auth import Auth

from src.orm.Cart import Cart
from src.orm.CartItem import CartItem
from src.orm.Product import Product
from src.orm.Invoice import Invoice
from src.orm.InvoiceItem import InvoiceItem


def get_authenticated_user(request, response):
    """ 
    Extract the authenticated user's ID from the JWT. 
    
    Unlike the cart helper above, this version directly 
    returns an HTTP response when authentication fails. 
    """
    # Try retrieving the request's authorization header otherwise default to ""
    auth_header = request.headers.get("authorization", "")

    # Checks if the auth_header is empty or if it contains the required "Bearer " prefix
    # If it doesn't then it throws a 401 with an error message
    if not auth_header or not auth_header.startswith("Bearer "):
        return response({"error": "Authorization header required"}, 401)

    # Remove "Bearer " prefix
    token = auth_header[7:]

    # Decoded token payload if its valid
    # If token payload is invalid result will be falsy
    payload = Auth.valid_token_static(token)

    # If the payload is None, throw 401 and "Unauthorized"
    if not payload:
        return response("Unauthorized", 401)

    # Returns user_id value from valid payload
    return payload.get("user_id")


@post("/api/checkout")
@description("Checkout the current user's cart and create an invoice")
@tags(["checkout"])
@example_response(201, {
    "message": "Checkout successful",
    "invoice": {
        "id": 12,
        "user_id": 1,
        "cart_id": 5,
        "total": 3899.98,
        "status": "created",
        "items": [
            {
                "id": 20,
                "product_id": 3,
                "product_name": "Mechanical Keyboard",
                "price": 1299.99,
                "quantity": 2
            },
            {
                "id": 21,
                "product_id": 4,
                "product_name": "Mouse",
                "price": 1299.99,
                "quantity": 1
            }
        ]
    }
})
@example_response(400, {
    "error": "Your cart is empty"
})
@example_response(401, {
    "error": "Unauthorized"
})
async def checkout(request, response):
    """ 
    Convert the authenticated user's active cart into an invoice. 
    """

    # Identify the authenticated user.
    user_id = get_authenticated_user(request)

    if user_id is None:
        return response(
            {"error": "Unauthorized"},
            401
        )

    # Find the user's active cart
    carts = Cart.where(
        "user_id = ? AND status = ?",
        [user_id, "active"],
        limit=1
    )

    # Checkout cannot happen without an active cart.
    if len(carts) == 0:
        return response(
            {"error": "No active cart found"},
            400
        )

    cart = carts[0]

    # Retrieve all items in the cart.
    items = CartItem.where(
        "cart_id = ?",
        [cart.id]
    )

    # A cart with no items cannot be checked out.
    if len(items) == 0:
        return response(
            {"error": "Your cart is empty"},
            400
        )

    # Keep track of the final invoice total and the data 
    # required to create invoice item records.
    total = 0
    invoice_items = []

    # Validate every cart item and calculate the final total.
    for item in items:
        product = Product.find_by_id(item.product_id)

        # The product may have been deleted after it was added to 
        # the cart, so make sure it still exists.
        if product is None:
            return response(
                {
                    "error": f"Product {item.product_id} no longer exists"
                },
                400
            )

        # Do not allow checkout for products that are now out of stock.
        if not product.in_stock:
            return response(
                {
                    "error": f"{product.name} is out of stock"
                },
                400
            )

        # Calculate this item's contribution to the invoice total.
        price = float(product.price)
        item_total = price * item.quantity

        total += item_total

        # Save a snapshot of the product information for the invoice. 
        # Storing product_name and price on the invoice item means the 
        # invoice can preserve what was purchased even if the product 
        # later changes.
        invoice_items.append({
            "product_id": product.id,
            "product_name": product.name,
            "price": price,
            "quantity": item.quantity
        })

    # Create the invoice record.
    invoice = Invoice.create({
        "user_id": user_id,
        "cart_id": cart.id,
        "total": total,
        "status": "created"
    })

    # Stop if the invoice could not be created.
    if invoice is False:
        return response(
            {"error": "Could not create invoice"},
            500
        )

    # Create a separate InvoiceItem record for every cart item.
    created_items = []

    for item_data in invoice_items:
        invoice_item = InvoiceItem.create({
            "invoice_id": invoice.id,
            "product_id": item_data["product_id"],
            "product_name": item_data["product_name"],
            "price": item_data["price"],
            "quantity": item_data["quantity"]
        })

        # If an invoice item cannot be created, report a server error.
        if invoice_item is False:
            return response(
                {"error": "Could not create invoice item"},
                500
            )

        created_items.append({
            "id": invoice_item.id,
            "product_id": item_data["product_id"],
            "product_name": item_data["product_name"],
            "price": item_data["price"],
            "quantity": item_data["quantity"]
        })

    # The checkout has now been completed, so the cart should no 
    # longer be considered the user's active cart.
    cart.status = "completed"

    if cart.save() is False:
        return response(
            {"error": "Could not complete cart"},
            500
        )

    # Return the newly created invoice and its items.
    return response({
        "message": "Checkout successful",
        "invoice": {
            "id": invoice.id,
            "user_id": user_id,
            "cart_id": cart.id,
            "total": total,
            "status": invoice.status,
            "items": created_items
        }
    }, 201)