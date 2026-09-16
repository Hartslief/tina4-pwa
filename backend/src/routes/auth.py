from tina4_python.core.router import get, post, noauth
from tina4_python.swagger import description, tags
from tina4_python.auth import Auth
from src.orm.User import User


@noauth()
@description("Register a new user")
@tags(["auth"])
@post("/api/auth/register")
async def register(request, response):
    """Register a new user."""
    body = request.body
    email = body.get("email", "")
    password = body.get("password", "")

    if not email or not password:
        return response({"error": "Email and password required"}, 400)

    # Check if user exists
    existing = User()
    if existing.load("email = ?", [email]):
        return response({"error": "Email already registered"}, 409)

    # Create user with hashed password
    user = User.create({
        "email": email,
        "password": Auth.hash_password(password),
        # tina4:edit  add roles/permissions here
        "role": "user",
    })
    return response({"message": "Registered", "id": user.id}, 201)


@noauth()
@description("Login and receive JWT token")
@tags(["auth"])
@post("/api/auth/login")
async def login(request, response):
    """Login with email and password."""
    body = request.body
    email = body.get("email", "")
    password = body.get("password", "")

    user = User()
    if not user.load("email = ?", [email]):
        return response({"error": "Invalid credentials"}, 401)

    if not Auth.check_password(password, user.password):
        return response({"error": "Invalid credentials"}, 401)

    token = Auth.get_token({"user_id": user.id, "email": user.email, "role": user.role})
    return response({"token": token})


@description("Get current user profile")
@tags(["auth"])
@get("/api/auth/me")
async def me(request, response):
    """Get current authenticated user."""
    auth_header = request.headers.get("authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else ""
    payload = Auth.valid_token_static(token) if token else None
    if not payload:
        return response({"error": "Unauthorized"}, 401)
    user = User.find_by_id(payload.get("user_id"))
    if not user:
        return response({"error": "User not found"}, 404)
    return response({"id": user.id, "email": user.email, "role": user.role})
