from tina4_python.orm import ORM, DateTimeField, ForeignKeyField, IntegerField, StringField
from src.orm.User import User


class Cart(ORM):
    table_name = "cart"

    id = IntegerField(primary_key=True, auto_increment=True)

    user_id = IntegerField()
    status = StringField()

    user = ForeignKeyField(to=User)

    created_at = DateTimeField()