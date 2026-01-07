import React, { useState } from 'react';
import { 
  Box, Grid, Typography, List, ListItemButton, 
  ListItemText, Collapse, Divider, Button, Paper 
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useProducts, useNavigation } from "../../features/products";
import { ProductCard } from '../../features/products';

export const BrowseProductsPage = () => {
  const [openSuper, setOpenSuper] = useState({});
  const [openLine, setOpenLine] = useState({});
  const [filters, setFilters] = useState({});

  const { data: products, isLoading, isError } = useProducts(filters);
  const { data: navigation } = useNavigation();

  const handleToggle = (setter, id) => {
    setter(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography color="error">Error loading products.</Typography>;

  return (
    <Box sx={{ display: 'flex', p: 3, gap: 3 }}>
      {/* Sidebar */}
      <Paper variant="outlined" sx={{ width: 300, height: 'fit-content', p: 1 }}>
        <Typography variant="h6" sx={{ p: 2 }}>Browse</Typography>
        <Divider />
        <List component="nav">
          {navigation?.map((superCat) => (
            <React.Fragment key={superCat.id}>
              <ListItemButton onClick={() => {
                handleToggle(setOpenSuper, superCat.id);
              }}>
                <ListItemText primary={superCat.name} primaryTypographyProps={{ fontWeight: 'bold' }} />
                {openSuper[superCat.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openSuper[superCat.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {superCat.product_lines.map((line) => (
                    <React.Fragment key={line.id}>
                      <ListItemButton sx={{ pl: 4 }} onClick={() => {
                        handleToggle(setOpenLine, line.id);
                      }}>
                        <ListItemText primary={line.name} />
                        {openLine[line.id] ? <ExpandLess /> : <ExpandMore />}
                      </ListItemButton>

                      <Collapse in={openLine[line.id]} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {line.categories.map((cat) => (
                            <ListItemButton 
                              key={cat.id} 
                              sx={{ pl: 8 }} 
                              selected={filters.category_id === cat.id}
                              onClick={() => setFilters({ 
                                super_category_id: superCat.id, 
                                product_line_id: line.id, 
                                category_id: cat.id 
                              })}
                            >
                              <ListItemText secondary={cat.name} />
                            </ListItemButton>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
        <Button fullWidth onClick={() => setFilters({})} sx={{ mt: 2 }}>Clear Filters</Button>
      </Paper>

      {/* Grid */}
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={3}>
          {products?.length > 0 ? (
            products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))
          ) : (
            <Typography sx={{ m: 'auto', mt: 5 }}>No products found.</Typography>
          )}
        </Grid>
      </Box>
    </Box>
  );
};