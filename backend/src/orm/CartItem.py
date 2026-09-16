from tina4_python.orm import ORM, DateTimeField, ForeignKeyField, IntegerField
from src.orm.Cart import Cart
from src.orm.Product import Product


class CartItem(ORM):
    table_name = "cart_item"

    id = IntegerField(primary_key=True, auto_increment=True)

    cart_id = IntegerField()
    product_id = IntegerField()
    quantity = IntegerField()

    cart = ForeignKeyField(to=Cart)
    product = ForeignKeyField(to=Product)

    created_at = DateTimeField()