from tina4_python.core.router import get, post, noauth
from tina4_python.swagger import description, tags, example, example_response
from tina4_python.auth import Auth
from src.orm.User import User

# Registration must be publicly accessible because the user does not 
# have a JWT token yet.
@noauth()
@post("/api/auth/register")
@description("Register a new user")
@tags(["auth"])
@example({
    "email": "newuser@example.com",
    "password": "password123"
})
@example_response(201, {
    "message": "Registered",
    "id": 5
})
@example_response(400, {
    "error": "Email and password required"
})
@example_response(409, {
    "error": "Email already registered"
})
async def register(request, response):
    """
    Register a new user.
    """

    # Read the submitted registration details.
    body = request.body
    email = body.get("email", "")
    password = body.get("password", "")

    # Both fields are required before an account can be created.
    if not email or not password:
        return response({"error": "Email and password required"}, 400)

    # Check whether another account already uses this email address.
    existing = User()
    if existing.load("email = ?", [email]):
        return response({"error": "Email already registered"}, 409)

    # Create the user and hash the password before storing it. 
    # Passwords should never be stored as plain text in the database
    user = User.create({
        "email": email,
        "password": Auth.hash_password(password),
        # New accounts are normal users by default.
        "role": "user",
    })

    # Return the new user's ID.
    return response({"message": "Registered", "id": user.id}, 201)


# Login must also be publicly accessible because the user needs to 
# obtain a JWT token before accessing protected endpoints.
@noauth()
@post("/api/auth/login")
@description("Login and receive JWT token")
@tags(["auth"])
@example({
    "email": "newuser@example.com",
    "password": "password123"
})
@example_response(200, {
    "token": "eyJhbGciOiJIUzI1NiIs..."
})
@example_response(401, {
    "error": "Invalid credentials"
})
async def login(request, response):
    """
    Login with email and password.
    """

    # Read the login credentials from the request body.
    email = request.body.get("email", "")
    password = request.body.get("password", "")

    # Find the account associated with the supplied email address.
    user = User()

    # Compare the supplied email against the stored emails
    if not user.load("email = ?", [email]):
        return response({"error": "Invalid credentials"}, 401)

    # Compare the supplied password against the stored password hash.
    if not Auth.check_password(password, user.password):
        return response({"error": "Invalid credentials"}, 401)

    # Create a JWT containing the information the application needs 
    # to identify and authorize the user.
    token = Auth.get_token({"user_id": user.id, "email": user.email, "role": user.role})

    # Send the JWT back to the frontend.
    return response({"token": token})

# Unlike register/login, this endpoint is protected by authentication.
@get("/api/auth/me")
@description("Get current user profile")
@tags(["auth"])
@example_response(200, {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin"
})
@example_response(401, {
    "error": "Unauthorized"
})
@example_response(404, {
    "error": "User not found"
})
async def me(request, response):
    """
    Get current authenticated user.
    """

    # Read the Authorization header.
    auth_header = request.headers.get("authorization", "")

    # A valid header should look like: 
    # Authorization: Bearer <token> 
    # Remove the first seven characters ("Bearer ") to get the token.
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""

    # Validate and decode the JWT.
    payload = Auth.valid_token_static(token) if token else None

    # Reject the request if the token is missing or invalid.
    if not payload:
        return response({"error": "Unauthorized"}, 401)

    # Use the user ID stored inside the JWT to retrieve the user.
    user = User.find_by_id(payload.get("user_id"))

    # The token may be valid even if the account was subsequently 
    # removed, so verify that the user still exists.
    if not user:
        return response({"error": "User not found"}, 404)

    # Return only public account information. 
    # The password hash is deliberately excluded.
    return response({"id": user.id, "email": user.email, "role": user.role})
