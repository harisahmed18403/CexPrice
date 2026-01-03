import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable

class ProductLine(BaseTable):
    __tablename__ = "product_lines"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    super_cat_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("super_cat.id"), index=True
    )

    super_cat: so.Mapped["SuperCat"] = so.relationship(
        back_populates="product_lines"
    )

    categories: so.Mapped[list["Category"]] = so.relationship(
        back_populates="product_line",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return "<ProductLine {}>".format(self.name)
