import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable
class CexProduct(BaseTable):
    __tablename__ = 'cex_products'

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    cex_id: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)

    variant_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("product_variants.id", name='variant_id'), index=True
    )
    variant: so.Mapped["ProductVariant"] = so.relationship(
        back_populates="cex_product"
    )

    def __repr__(self):
        return "<CexProduct {}>".format(self.cex_id)