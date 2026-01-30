
import sqlalchemy as sa
import sqlalchemy.orm as so
from app.models import BaseTable
from typing import List, Optional

class Product(BaseTable):
    __tablename__ = "products"

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255), index=True, unique=True)
    
    category_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey("categories.id"), index=True
    )
    category: so.Mapped["Category"] = so.relationship(back_populates="products")
    
    image_path: so.Mapped[Optional[str]] = so.mapped_column(sa.String(2048), nullable=True)

    variants: so.Mapped[List["ProductVariant"]] = so.relationship(back_populates="product", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category_id': self.category_id,
            'image_path': self.image_path,
            'variants': [v.to_dict() for v in self.variants]
        }
