import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Button, Paper,
  Pagination, TextField, MenuItem, Select, FormControl, InputLabel,
  InputAdornment, IconButton, CircularProgress, Tabs, Tab,
  Chip, Fade, Container, Stack
} from '@mui/material';
import { Search, Clear, FilterList } from '@mui/icons-material';
import { useProducts, useNavigation } from "../../features/products";
import { ProductCard } from '../../features/products';
import { PageHeader } from '../../components/common/PageHeader';

export const BrowseProductsPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 24,
    sort_by: 'name',
    order: 'asc',
    search: '',
    super_category_id: null,
    product_line_id: 106, // Default to Phones
    category_id: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: productData, isLoading, isError } = useProducts(filters);
  const { data: navigation } = useNavigation();
  
  const products = productData?.items || [];
  const totalPages = productData?.pages || 1;

  const handleSortChange = (event) => {
    const [sort_by, order] = event.target.value.split('-');
    setFilters(prev => ({ ...prev, sort_by, order, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allProductLines = navigation?.flatMap(s => s.product_lines) || [];

  return (
    <Box>
      <PageHeader 
        title="Browse Products" 
        subtitle="Explore our inventory of mobile devices and accessories."
      />

      <Box sx={{ mb: 4, position: 'sticky', top: 70, zIndex: 10, bgcolor: 'background.default', pt: 1 }}>
        <Tabs 
          value={allProductLines.some(l => l.id === filters.product_line_id) ? filters.product_line_id : (filters.product_line_id === null ? null : false)} 
          onChange={(e, newVal) => setFilters(prev => ({ ...prev, product_line_id: newVal, category_id: null, page: 1 }))}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 2, 
            borderColor: 'common.black',
            mb: 2,
            '& .MuiTabs-indicator': { height: 4, borderRadius: 0, bgcolor: 'common.black' }
          }}
        >
          <Tab label="All Categories" value={null} sx={{ fontWeight: 700 }} />
          {allProductLines.map(line => (
            <Tab key={line.id} label={line.name} value={line.id} sx={{ fontWeight: 700 }} />
          ))}
        </Tabs>

        <Paper sx={{ p: 2, borderRadius: 0, border: '2px solid black', boxShadow: 'none' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField 
              fullWidth 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}><Clear /></IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 0 }
              }}
            />
            
            <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={`${filters.sort_by}-${filters.order}`}
                  label="Sort By"
                  onChange={handleSortChange}
                   sx={{ borderRadius: 0 }}
                >
                  <MenuItem value="name-asc">Name (A-Z)</MenuItem>
                  <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                  <MenuItem value="price-asc">Price (Low-High)</MenuItem>
                  <MenuItem value="price-desc">Price (High-Low)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {filters.product_line_id && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                label="All" 
                size="small" 
                variant={filters.category_id === null ? "filled" : "outlined"}
                color={filters.category_id === null ? "primary" : "default"}
                onClick={() => setFilters(prev => ({ ...prev, category_id: null, page: 1 }))}
                sx={{ borderRadius: 1.5, fontWeight: 600 }}
              />
              {allProductLines.find(l => l.id === filters.product_line_id)?.categories.map(cat => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  variant={filters.category_id === cat.id ? "filled" : "outlined"}
                  color={filters.category_id === cat.id ? "primary" : "default"}
                  onClick={() => setFilters(prev => ({ ...prev, category_id: cat.id, page: 1 }))}
                  sx={{ borderRadius: 0, fontWeight: 800, border: '1px solid black' }}
                />
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="error">Failed to load products.</Typography>
          <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Retry</Button>
        </Box>
      ) : products.length > 0 ? (
        <Fade in timeout={500}>
          <Box>
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <Pagination 
                count={totalPages} 
                page={filters.page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
               sx={{ '& .MuiPaginationItem-root': { fontWeight: 900, borderRadius: 0, border: '1px solid transparent', '&.Mui-selected': { border: '2px solid black', bgcolor: 'transparent', color: 'black' } } }}
              />
            </Box>
          </Box>
        </Fade>
      ) : (
        <Box sx={{ textAlign: 'center', py: 15 }}>
          <Search sx={{ fontSize: 64, mb: 2, color: 'text.disabled', opacity: 0.3 }} />
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 700 }}>No products found</Typography>
          <Typography color="text.secondary">Try adjusting your filters or search term.</Typography>
          <Button             variant="outlined" 
             sx={{ mt: 3, borderRadius: 0, border: '2px solid black', fontWeight: 900 }}
            onClick={() => {
              setFilters(prev => ({ ...prev, search: '', category_id: null }));
              setSearchTerm('');
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      )}
    </Box>
  );
};