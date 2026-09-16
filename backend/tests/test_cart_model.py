"""Real ORM roundtrip test for Cart — no mocks, real SQLite.

Generated with src/orm/Cart.py by `tina4python generate model
Cart`. The model scaffold is working code, so this passes on
generation: it binds a real on-disk SQLite database, creates the table,
saves a row and reads it back.
"""
from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from src.orm.Cart import Cart


class TestCartModel:
    """Cart persists to and reads back from real SQLite."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_cart_model.db"))
        Cart.create_table()

    def test_create_and_read_back(self):
        row = Cart.create({"user_id": 1, "status": "sample"})
        assert row and row.id, "create() should persist and return the row"
        fetched = Cart.find_by_id(row.id)
        assert fetched is not None
        assert fetched.id == row.id
        assert fetched.status == "sample"

    def test_find_missing_returns_none(self):
        assert Cart.find_by_id(999999) is None
