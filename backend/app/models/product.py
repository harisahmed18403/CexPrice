import sqlalchemy as sa
import sqlalchemy.orm as so
import os
from app.models import BaseTable
from flask import url_for, current_app

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

    image_path: so.Mapped[str] = so.mapped_column(sa.String(2048), nullable=True)
    def get_url(self):
        # 1. Handle NULL (None) or empty strings immediately
        if not self.image_path:
            return url_for('static', filename='images/placeholder.png')

        # 2. Check if it's an external URL
        if self.image_path.startswith(('http://', 'https://')):
            return self.image_path
        
        # 3. Handle local files + check if the file actually exists on disk
        local_path = os.path.join(current_app.root_path, 'static/uploads', self.image_path)
        
        if os.path.exists(local_path):
            return url_for('static', filename='uploads/' + self.image_path)
        
        # 4. Fallback if the database has a path but the file is missing
        return url_for('static', filename='images/placeholder.png')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'cash_price': float(self.cash_price),
            'category_id': self.category_id,
            'image_path': self.get_url()
        }

    def __repr__(self):
        return "<Product {}>".format(self.name)
