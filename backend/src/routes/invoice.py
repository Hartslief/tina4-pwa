from tina4_python.core.router import get
from tina4_python.swagger import description, tags, example, example_response
from tina4_python.auth import Auth

from src.orm.Invoice import Invoice
from src.orm.InvoiceItem import InvoiceItem


def get_authenticated_user(request):
    """ 
    Extract the authenticated user's ID from the JWT. 
    Returns None when the request does not contain a valid token. 
    """

    # Read the Authorization header sent by the frontend.
    auth_header = request.headers.get("authorization", "")

    # Reject requests that do not use the expected Bearer token format.
    if not auth_header.startswith("Bearer "):
        return None

    # Remove the "Bearer " prefix.
    token = auth_header[7:]

    # Validate and decode the JWT.
    payload = Auth.valid_token_static(token)

    if not payload:
        return None

    # Return the ID stored inside the token.
    return payload.get("user_id")


@get("/api/invoices/{id:int}")
@description("Get an invoice belonging to the current user")
@tags(["invoice"])
@example_response(200, {
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
        }
    ]
})
@example_response(401, {
    "error": "Unauthorized"
})
@example_response(404, {
    "error": "Invoice not found"
})
async def get_invoice(id, request, response):
    """ 
    Retrieve a single invoice belonging to the authenticated user. 
    """

    # Identify the user making the request.
    user_id = get_authenticated_user(request)

    if user_id is None:
        return response(
            {"error": "Unauthorized"},
            401
        )

    # Find the requested invoice.
    invoice = Invoice.find_by_id(id)

    if invoice is None:
        return response(
            {"error": "Invoice not found"},
            404
        )

    # Security check:
    # Knowing another user's invoice ID must not allow someone to 
    # retrieve that invoice. 
    # Returning 404 instead of 403 also avoids revealing that an 
    # invoice belonging to another user exists.
    if invoice.user_id != user_id:
        return response(
            {"error": "Invoice not found"},
            404
        )

    # Retrieve all items belonging to the invoice.
    items = InvoiceItem.where(
        "invoice_id = ?",
        [invoice.id]
    )

    invoice_items = []

    # Convert each ORM invoice item into the API response format.
    for item in items:
        invoice_items.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product_name,
            "price": float(item.price),
            "quantity": item.quantity
        })

    # Return the invoice together with all of its items.
    return response({
        "id": invoice.id,
        "user_id": invoice.user_id,
        "cart_id": invoice.cart_id,
        "total": float(invoice.total),
        "status": invoice.status,
        "items": invoice_items
    })