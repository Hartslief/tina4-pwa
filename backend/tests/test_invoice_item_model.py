"""Real ORM roundtrip test for InvoiceItem — no mocks, real SQLite.

Generated with src/orm/InvoiceItem.py by `tina4python generate model
InvoiceItem`. The model scaffold is working code, so this passes on
generation: it binds a real on-disk SQLite database, creates the table,
saves a row and reads it back.
"""
from tina4_python.database import Database
from tina4_python.orm.model import bind_database
from src.orm.InvoiceItem import InvoiceItem


class TestInvoiceItemModel:
    """InvoiceItem persists to and reads back from real SQLite."""

    def setup_method(self, _method):
        bind_database(Database("sqlite:///test_invoice_item_model.db"))
        InvoiceItem.create_table()

    def test_create_and_read_back(self):
        row = InvoiceItem.create({"invoice_id": 1, "product_id": 1, "product_name": "sample", "price": 1.5, "quantity": 1})
        assert row and row.id, "create() should persist and return the row"
        fetched = InvoiceItem.find_by_id(row.id)
        assert fetched is not None
        assert fetched.id == row.id
        assert fetched.product_name == "sample"

    def test_find_missing_returns_none(self):
        assert InvoiceItem.find_by_id(999999) is None
