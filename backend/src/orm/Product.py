from tina4_python.orm import ORM, BooleanField, DateTimeField, IntegerField, NumericField, StringField, TextField


class Product(ORM):
    table_name = "product"
    # plural_table = True  # uncomment for plural: products

    id = IntegerField(primary_key=True, auto_increment=True)
    # tina4:edit  add fields here
    name = StringField()
    description = TextField()
    price = NumericField()
    in_stock = BooleanField()
    # tina4:edit  add relationships here (e.g. author = ForeignKeyField(to=Author))
    created_at = DateTimeField()
