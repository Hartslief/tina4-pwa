from tina4_python.orm import ORM, DateTimeField, ForeignKeyField, IntegerField, NumericField, StringField
from src.orm.User import User
from src.orm.Cart import Cart


class Invoice(ORM):
    table_name = "invoice"

    id = IntegerField(primary_key=True, auto_increment=True)

    user_id = IntegerField()
    cart_id = IntegerField()
    total = NumericField()
    status = StringField()

    user = ForeignKeyField(to=User)
    cart = ForeignKeyField(to=Cart)

    created_at = DateTimeField()