import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable
from datetime import datetime, timezone
from typing import Optional, List

class Sale(BaseTable):
    __tablename__ = "sales"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    transaction_type: so.Mapped[str] = so.mapped_column(sa.String(10)) # 'buy', 'sell' or 'repair'
    created_at: so.Mapped[datetime] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    
    customer_name: so.Mapped[Optional[str]] = so.mapped_column(sa.String(128))
    customer_email: so.Mapped[Optional[str]] = so.mapped_column(sa.String(128))
    customer_phone: so.Mapped[Optional[str]] = so.mapped_column(sa.String(32))
    
    total_amount: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2))
    
    items: so.Mapped[List["SaleItem"]] = so.relationship(
        back_populates="sale",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_type': self.transaction_type,
            'created_at': self.created_at.isoformat(),
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'total_amount': float(self.total_amount),
            'items': [item.to_dict() for item in self.items]
        }

class SaleItem(BaseTable):
    __tablename__ = "sale_items"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    sale_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("sales.id"), index=True)
    
    # Link to existing product variant (optional)
    variant_id: so.Mapped[Optional[int]] = so.mapped_column(sa.ForeignKey("product_variants.id"), index=True)
    
    # If not an existing product, store name/description here
    custom_product_name: so.Mapped[Optional[str]] = so.mapped_column(sa.String(128))
    
    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, default=1)
    price_per_unit: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2))
    total_price: so.Mapped[float] = so.mapped_column(sa.Numeric(10, 2))

    sale: so.Mapped["Sale"] = so.relationship(back_populates="items")
    variant: so.Mapped[Optional["ProductVariant"]] = so.relationship()

    def to_dict(self):
        return {
            'id': self.id,
            'variant_id': self.variant_id,
            'product_name': self.variant.name if self.variant else self.custom_product_name,
            'custom_product_name': self.custom_product_name,
            'quantity': self.quantity,
            'price_per_unit': float(self.price_per_unit),
            'total_price': float(self.total_price)
        }
