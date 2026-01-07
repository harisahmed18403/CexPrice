import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button 
} from '@mui/material';

export default function ProductCard({ product }) {
  return (
    <Card sx={{ maxWidth: 345, borderRadius: 2, boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="100"
        width="auto"
        image={product.image_path}
        alt={product.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {product.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          ${product.cash_price}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" variant="contained" fullWidth>
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}