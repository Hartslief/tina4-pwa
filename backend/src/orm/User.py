from tina4_python.orm import ORM, DateTimeField, IntegerField, StringField


class User(ORM):
    table_name = "users"
    # plural_table = True  # uncomment for plural: userss

    id = IntegerField(primary_key=True, auto_increment=True)
    # tina4:edit  add fields here
    email = StringField()
    password = StringField()
    role = StringField()
    # tina4:edit  add relationships here (e.g. author = ForeignKeyField(to=Author))
    created_at = DateTimeField()
