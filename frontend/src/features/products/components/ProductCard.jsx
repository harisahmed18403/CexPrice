import React from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions, 
  Typography, 
  Button,
  Box
} from '@mui/material';

export default function ProductCard({ product }) {
  const variants = product.variants || [];
  const lowestPrice = variants.length > 0 
    ? Math.min(...variants.map(v => v.cash_price)) 
    : 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
      <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={product.image_path}
            alt={product.name}
            sx={{ objectFit: 'contain', p: 2, bgcolor: '#fff' }}
          />
          {variants.length > 1 && (
              <Chip 
                label={`${variants.length} Grades`} 
                size="small" 
                color="secondary"
                sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 'bold' }}
              />
          )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="subtitle1" component="div" sx={{ fontWeight: 'bold', lineBreak: 'anywhere', height: 48, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={product.name}>
          {product.name}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {variants.length > 1 && <Typography component="span" variant="caption" sx={{ mr: 0.5, color: 'text.secondary', fontWeight: 'normal' }}>From</Typography>}
            {import.meta.env.VITE_CURRENCY || '$'}{lowestPrice}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {variants.length > 0 ? `Refreshed Grades: ${variants.map(v => v.grade).join(', ')}` : 'No variant info available'}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 1.5, pt: 0 }}>
        <Button size="small" variant="contained" fullWidth>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}