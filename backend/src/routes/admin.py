from tina4_python import get, post, put, delete, role
from tina4_python.swagger import description, tags, example, example_response
from src.orm.Product import Product
from src.orm.User import User

###### PRODUCT ADMIN ROUTES #####

# Only users with the "admin" role can access this endpoint.
@role("admin")
@get("/api/admin/products")
@description("Get all products for the admin dashboard")
@tags(["admin-products"])
@example_response(200, {
    "records": [
        {
            "id": 1,
            "name": "Laptop",
            "description": "15-inch laptop",
            "price": 15000,
            "in_stock": True,
            "created_at": "2026-09-21T10:00:00"
        }
    ]
})
async def get_admin_products(response):
    """ 
    Return all products for the admin dashboard. 

    The public product endpoint is kept separate 
    from this endpoint so admin functionality can 
    have its own authorization and behavior. 
    """
    # Convert every Product ORM object into a dictionary that can be 
    # returned as JSON.
    return response({
        "records": [
            product.to_dict()
            for product in Product().select()
        ]
    })

# Only administrators are allowed to create products.
@role("admin")
@post("/api/admin/products")
@description("Create a new product")
@tags(["admin-products"])
@example({
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard",
    "price": 1299.99,
    "in_stock": True
})
@example_response(201, {
    "id": 11,
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard",
    "price": 1299.99,
    "in_stock": True
})
@example_response(400, {
    "error": "Product name is required"
})
async def create_product(request, response):
    """ 
    Create a new product from the request body. 
    """

    # Read the product fields from the JSON request body. 
    # name and price are required, while description and in_stock
    # have sensible defaults.
    name = request.body.get("name")
    description = request.body.get("description", "")
    price = request.body.get("price")
    in_stock = request.body.get("in_stock", True)

    # A product without a name is not valid.
    if not name:
        return response({
            "error": "Product name is required"
        }, 400)

    # Check explicitly for None rather than using `if not price`, 
    # because 0 is technically a number even though it is falsy in Python.
    if price is None:
        return response({
            "error": "Product price is required"
        }, 400)

    # Convert the supplied price to a number before saving it. 
    # This also catches values such as "abc" that cannot be converted 
    # to a floating-point number.
    try:
        price = float(price)
    except (TypeError, ValueError):
        return response({
            "error": "Product price must be a number"
        }, 400)

    # Create the Product ORM object using the validated values.
    product = Product({
        "name": name,
        "description": description,
        "price": price,
        "in_stock": bool(in_stock),
    })

    # Persist the new product to the database.
    product.save()

    # Return the newly created product. 
    # HTTP 201 indicates that a new resource was created.
    return response(product.to_dict(), 201)

# Only administrators can update products.
@role("admin")
@put("/api/admin/products/{id:int}")
@description("Update an existing product")
@tags(["admin-products"])
@example({
    "name": "Updated Keyboard",
    "description": "Updated mechanical keyboard",
    "price": 1399.99,
    "in_stock": True
})
@example_response(200, {
    "id": 1,
    "name": "Updated Keyboard",
    "description": "Updated mechanical keyboard",
    "price": 1399.99,
    "in_stock": True
})
@example_response(404, {
    "error": "Product not found"
})
@example_response(400, {
    "error": "Product price must be a number"
})
async def update_product(id, request, response):
    """ 
    Update an existing product. 
    """

    # Create an empty Product ORM object and load the product 
    # identified by the URL parameter.
    product = Product()
    found = product.load("id = ?", [id])

    # Store the request body so individual fields can be checked below.
    body = request.body

    # If no product with this ID exists, return a 404 response.
    if not found:
        return response({
            "error": "Product not found"
        }, 404)

    # Only update the name if the client actually supplied it.
    if "name" in body:

        # Prevent the product name from being changed to an empty value.
        if not body["name"]:
            return response({
                "error": "Product name cannot be empty"
            }, 400)

        product.name = body["name"]

    # Description is optional, so only change it when it was supplied.
    if "description" in body:
        product.description = body["description"]

    # Convert the price to a number if the client supplied a new price.
    if "price" in body:
        try:
            product.price = float(body["price"])
        except (TypeError, ValueError):
            return response({
                "error": "Product price must be a number"
            }, 400)

    # Update the stock status when it was included in the request.
    if "in_stock" in body:
        product.in_stock = bool(body["in_stock"])

    # Save all of the changes to the database.
    product.save()

    # Return the updated product.
    return response(product.to_dict())


# Only administrators can delete products.
@role("admin")
@delete("/api/admin/products/{id:int}")
@description("Delete a product")
@tags(["admin-products"])
@example_response(204, None)
@example_response(404, {
    "error": "Product not found"
})
async def delete_product(id, response):
    """ 
    Delete an existing product. 
    """

    # Load the actual ORM object that we want to delete. 
    # This is important because Tina4 needs the object's primary key 
    # when performing the delete operation.
    product = Product()
    found = product.load("id = ?", [id])

    # Return 404 if the requested product does not exist.
    if not found:
        return response({
            "error": "Product not found"
        }, 404)

    # Delete the loaded Product object from the database.
    product.delete()

    # A successful DELETE does not need to return a response body.
    return response(None, 204)


##### USER ADMIN ROUTES #####

# Only administrators can view the list of users.
@role("admin")
@get("/api/admin/users")
@description("Get all users for the admin dashboard")
@tags(["admin-users"])
@example_response(200, {
    "records": [
        {
            "id": 1,
            "email": "admin@example.com",
            "role": "admin",
            "created_at": "2026-09-21T10:00:00"
        }
    ]
})
async def get_admin_users(response):
    """ 
    Return the users needed by the admin dashboard. 
    """

    # Build a simplified dictionary for each user. 
    # We intentionally return selected fields rather than the complete 
    # User object so that sensitive fields such as the password hash 
    # are never exposed through this endpoint.
    return response({
        "records": [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at,
            }
            for user in User().select()
        ]
    })

# Only administrators can update users.
@role("admin")
@put("/api/admin/users/{id:int}")
@description("Update a user's email address or role")
@tags(["admin-users"])
@example({
    "email": "updated@example.com",
    "role": "user"
})
@example_response(200, {
    "id": 2,
    "email": "updated@example.com",
    "role": "user",
    "created_at": "2026-09-21T10:00:00"
})
@example_response(404, {
    "error": "User not found"
})
@example_response(409, {
    "error": "Email is already in use"
})
async def update_user(id, request, response):
    """ 
    Update a user's email address and/or role. 
    """

    # Load the user that matches the ID from the URL.
    user = User()
    found = user.load("id = ?", [id])

    # Return 404 when the user does not exist.
    if not found:
        return response({
            "error": "User not found"
        }, 404)

    ### EMAIL UPDATE ###

    # Only perform email validation if an email was included in the request.
    if "email" in request.body:
        email = request.body["email"]

        # Do not allow the email address to be emptied.
        if not email:
            return response({
                "error": "Email cannot be empty"
            }, 400)

        # Check whether another user already owns this email address. 
        # `id != ?` is important because the user is allowed to keep 
        # their existing email address.
        existing_user = User()
        existing = existing_user.load(
            "email = ? AND id != ?",
            [email, id],
        )

        # Prevent duplicate email addresses.
        if existing:
            return response({
                "error": "Email is already in use"
            }, 409)

        user.email = email

    ### ROLE UPDATE ###

    # Only update the role when one was supplied.
    if "role" in request.body:
        role_value = request.body["role"]

        # Restrict roles to the two roles supported by this application.
        if role_value not in ["user", "admin"]:
            return response({
                "error": "Role must be either 'user' or 'admin'"
            }, 400)

        user.role = role_value

    # Persist the changes.
    user.save()

    # Return the updated user. 
    # The password is deliberately not included in the response.
    return response({
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
    })

# Only administrators can delete users.
@role("admin")
@delete("/api/admin/users/{id:int}")
@description("Delete a user")
@tags(["admin-users"])
@example_response(204, None)
@example_response(404, {
    "error": "User not found"
})
@example_response(400, {
    "error": "You cannot delete your own account"
})
async def delete_user(id, request, response):
    """ 
    Delete a user account. 
    """

    # Load the user that should be deleted.
    user = User()
    found = user.load("id = ?", [id])

    # Return 404 if the user does not exist.
    if not found:
        return response({
            "error": "User not found"
        }, 404)

    # Get the ID of the currently authenticated administrator.
    auth_user_id = request.user.get("user_id")

    # Prevent an administrator from deleting their own account. 
    # Without this check, an admin could accidentally remove the account 
    # that is currently being used to manage the system.
    if auth_user_id is not None and int(auth_user_id) == int(id):
        return response({
            "error": "You cannot delete your own account"
        }, 400)

    # Delete the user from the database.
    user.delete()

    # Return a successful empty response.
    return response(None, 204)