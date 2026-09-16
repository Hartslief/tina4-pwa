"""Tests for products CRUD — reads public, writes gated.

Real end-to-end via TestClient: no mocks — real Router, real auth gate
(_check_auth), real JWT. A real SQLite DB + table is bound in setup so
the create path is exercised for real.
"""
import os

os.environ.setdefault("TINA4_SECRET", "test-secret")
os.environ.pop("TINA4_API_KEY", None)

from tina4_python.auth import get_token
from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from tina4_python.test_client import TestClient
from src.orm.Product import Product
import src.routes.products  # noqa: F401 — importing registers the routes


def _auth_headers():
    """A valid Bearer token for the gated write routes."""
    return {"Authorization": f"Bearer {get_token({'user_id': 1})}"}


class TestProduct:
    """Product CRUD — reads public, writes gated (secure by default)."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_products.db"))
        Product.create_table()

    def test_list_products_is_public(self):
        """GET is public — no token needed."""
        assert TestClient().get("/api/products").status == 200

    def test_create_product_requires_auth(self):
        """Secure by default: a tokenless POST is rejected with 401."""
        assert TestClient().post("/api/products", json={"name": "test"}).status == 401

    def test_create_product_with_token(self):
        """A valid Bearer token passes the gate and creates → 201."""
        res = TestClient().post("/api/products", json={"name": "test"}, headers=_auth_headers())
        assert res.status == 201
