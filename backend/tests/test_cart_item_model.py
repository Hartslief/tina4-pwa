"""Real ORM roundtrip test for CartItem — no mocks, real SQLite.

Generated with src/orm/CartItem.py by `tina4python generate model
CartItem`. The model scaffold is working code, so this passes on
generation: it binds a real on-disk SQLite database, creates the table,
saves a row and reads it back.
"""
from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from src.orm.CartItem import CartItem


class TestCartItemModel:
    """CartItem persists to and reads back from real SQLite."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_cart_item_model.db"))
        CartItem.create_table()

    def test_create_and_read_back(self):
        row = CartItem.create({"cart_id": 1, "product_id": 1, "quantity": 1})
        assert row and row.id, "create() should persist and return the row"
        fetched = CartItem.find_by_id(row.id)
        assert fetched is not None
        assert fetched.id == row.id

    def test_find_missing_returns_none(self):
        assert CartItem.find_by_id(999999) is None
