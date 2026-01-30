
import sqlalchemy as sa
import sqlalchemy.orm as so
import os
from typing import Optional
from app.models import BaseTable
from flask import url_for, current_app

class ProductVariant(BaseTable):
    __tablename__ = "product_variants"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(512), index=True)

    cash_price: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2))
    voucher_price: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2), nullable=True)
    sale_price: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2), nullable=True)

    product_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("products.id"), index=True
    )
    product: so.Mapped["Product"] = so.relationship(
        back_populates="variants"
    )

    grade: so.Mapped[Optional[str]] = so.mapped_column(sa.String(10), nullable=True)
    image_path: so.Mapped[str] = so.mapped_column(sa.String(2048), nullable=True)

    cex_product: so.Mapped["CexProduct"] = so.relationship(
        back_populates="variant",
        cascade="all, delete-orphan"
    )

    def get_url(self):
        if not self.image_path:
            return url_for('static', filename='images/placeholder.png')
        if self.image_path.startswith(('http://', 'https://')):
            return self.image_path
        return url_for('static', filename='uploads/' + self.image_path)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'cash_price': float(self.cash_price),
            'voucher_price': float(self.voucher_price) if self.voucher_price is not None else None,
            'sale_price': float(self.sale_price) if self.sale_price is not None else None,
            'product_id': self.product_id,
            'grade': self.grade,
            'image_path': self.get_url()
        }
