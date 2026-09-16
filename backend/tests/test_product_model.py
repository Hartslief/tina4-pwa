"""Real ORM roundtrip test for Product — no mocks, real SQLite.

Generated with src/orm/Product.py by `tina4python generate model
Product`. The model scaffold is working code, so this passes on
generation: it binds a real on-disk SQLite database, creates the table,
saves a row and reads it back.
"""
from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from src.orm.Product import Product


class TestProductModel:
    """Product persists to and reads back from real SQLite."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_product_model.db"))
        Product.create_table()

    def test_create_and_read_back(self):
        row = Product.create({"name": "sample", "description": "sample", "price": 1.5, "in_stock": True})
        assert row and row.id, "create() should persist and return the row"
        fetched = Product.find_by_id(row.id)
        assert fetched is not None
        assert fetched.id == row.id
        assert fetched.name == "sample"

    def test_find_missing_returns_none(self):
        assert Product.find_by_id(999999) is None
