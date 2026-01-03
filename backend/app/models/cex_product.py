import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable
class CexProduct(BaseTable):
    __tablename__ = 'cex_products'

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    cex_id: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    product_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("products.id", name='product_id'), index=True
    )
    product: so.Mapped["Product"] = so.relationship(
        back_populates="cex_product"
    )

    def __repr__(self):
        return "<CexProduct {}>".format(self.cex_id)