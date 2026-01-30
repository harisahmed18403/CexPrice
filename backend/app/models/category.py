import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable
from app.models.associations import category_product_line

class Category(BaseTable):
    __tablename__ = "categories"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    is_active: so.Mapped[bool] = so.mapped_column(sa.Boolean, default=True)

    product_lines: so.Mapped[list["ProductLine"]] = so.relationship(
        secondary=category_product_line,
        back_populates="categories"
    )

    products: so.Mapped[list["Product"]] = so.relationship(
        back_populates="category"
    )

    def __repr__(self):
        return "<Category {}>".format(self.name)
