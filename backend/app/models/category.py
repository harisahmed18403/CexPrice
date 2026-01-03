import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable

class Category(BaseTable):
    __tablename__ = "categories"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    product_line_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("product_lines.id"), index=True
    )

    product_line: so.Mapped["ProductLine"] = so.relationship(
        back_populates="categories"
    )

    products: so.Mapped[list["Product"]] = so.relationship(
        back_populates="category"
    )

    def __repr__(self):
        return "<Category {}>".format(self.name)
