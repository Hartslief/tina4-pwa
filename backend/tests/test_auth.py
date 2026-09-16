"""Real auth test — register / login / me via the real TestClient.

Generated with the auth scaffold by `tina4python generate auth`. No mocks:
real Router, real Auth (PBKDF2 + JWT), real SQLite. register + login are
public (@noauth); the token from login authenticates /api/auth/me.
"""
import os

os.environ.setdefault("TINA4_SECRET", "test-secret")
os.environ.pop("TINA4_API_KEY", None)

from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from tina4_python.test_client import TestClient
from src.orm.User import User
import src.routes.auth  # noqa: F401 — importing registers the auth routes


class TestAuth:
    """register → login → me, end to end against real SQLite."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_auth.db"))
        User.create_table()
        for existing in User.all(limit=1000):   # start from an empty table
            existing.delete()

    def test_register_then_login_then_me(self):
        client = TestClient()
        registered = client.post("/api/auth/register",
                                 json={"email": "a@b.c", "password": "secret12"})
        assert registered.status == 201

        duplicate = client.post("/api/auth/register",
                                json={"email": "a@b.c", "password": "secret12"})
        assert duplicate.status == 409

        login = client.post("/api/auth/login",
                            json={"email": "a@b.c", "password": "secret12"})
        assert login.status == 200
        token = login.json()["token"]
        assert token

        profile = client.get("/api/auth/me",
                             headers={"Authorization": f"Bearer {token}"})
        assert profile.status == 200
        assert profile.json()["email"] == "a@b.c"

    def test_login_wrong_password_is_401(self):
        client = TestClient()
        client.post("/api/auth/register",
                    json={"email": "x@y.z", "password": "secret12"})
        bad = client.post("/api/auth/login",
                          json={"email": "x@y.z", "password": "WRONG"})
        assert bad.status == 401

    def test_me_without_token_is_401(self):
        assert TestClient().get("/api/auth/me").status == 401
