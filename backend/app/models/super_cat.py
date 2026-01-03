import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable

class SuperCat(BaseTable):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    product_lines: so.Mapped[list['ProductLine']] = so.relationship('ProductLine', back_populates='super_cat', cascade='all, delete-orphan')

    def __repr__(self):
        return '<SuperCat {}>'.format(self.name)