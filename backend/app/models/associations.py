import sqlalchemy as sa
from app import db

category_product_line = sa.Table(
    'category_product_line',
    db.Model.metadata,
    sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id'), primary_key=True),
    sa.Column('product_line_id', sa.Integer, sa.ForeignKey('product_lines.id'), primary_key=True)
)
