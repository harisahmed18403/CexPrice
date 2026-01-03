import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable

class Product(BaseTable):
    __tablename__ = "products"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    cash_price: so.Mapped[float] = so.mapped_column(sa.Numeric())

    category_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("categories.id"), index=True
    )

    category: so.Mapped["Category"] = so.relationship(
        back_populates="products"
    )

    cex_product: so.Mapped["CexProduct"] = so.relationship(
        back_populates="product",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return "<Product {}>".format(self.name)
