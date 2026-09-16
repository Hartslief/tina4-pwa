from tina4_python.orm import ORM, DateTimeField, ForeignKeyField, IntegerField, NumericField, StringField
from src.orm.Invoice import Invoice
from src.orm.Product import Product


class InvoiceItem(ORM):
    table_name = "invoice_item"

    id = IntegerField(primary_key=True, auto_increment=True)

    invoice_id = IntegerField()
    product_id = IntegerField()
    product_name = StringField()
    price = NumericField()
    quantity = IntegerField()

    invoice = ForeignKeyField(to=Invoice)
    product = ForeignKeyField(to=Product)

    created_at = DateTimeField()