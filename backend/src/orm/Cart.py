from tina4_python.orm import ORM, DateTimeField, IntegerField, StringField

class Cart(ORM):
    table_name = "cart"

    id = IntegerField(primary_key=True, auto_increment=True)

    user_id = IntegerField()
    status = StringField()

    created_at = DateTimeField()