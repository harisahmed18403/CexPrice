import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { 
  TextField, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  CircularProgress, 
  ClickAwayListener,
  Box,
  Typography,
  ListItemButton,
  Button,
  InputAdornment,
  Fade
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function ProductsSearch({onSelect, onBuy}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  // Search Logic encapsulated inside the component
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedQuery.trim().length > 2) {
        setLoading(true);
        console.log("Searching for:", debouncedQuery);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&variant=true`);
          const data = await res.json();
          setResults(data);
          setOpen(true);
        } catch (err) {
          console.error("Search error", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setOpen(false);
      }
    };

    searchProducts();
  }, [debouncedQuery]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <TextField
            fullWidth
            placeholder="Search products by name or SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 2 && setOpen(true)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: loading ? <CircularProgress size={20} /> : null,
              sx: { 
                borderRadius: 0,
                bgcolor: 'background.paper',
                '&.Mui-focused': {
                  boxShadow: 'none',
                  border: '2px solid black'
                }
              }
            }}
          />

          <Fade in={open}>
            <Paper 
              elevation={10} 
              sx={{ 
                position: 'absolute', 
                top: 'calc(100% + 4px)', 
                left: 0, 
                right: 0, 
                zIndex: 100,
                maxHeight: 480,
                overflowY: 'auto',
                borderRadius: 0,
                border: '2px solid black',
                boxShadow: 'none',
                overflow: 'hidden'
              }}
            >
              <List sx={{ p: 0 }}>
                {results.length > 0 ? (
                  results.map((product) => (
                    <ListItem 
                      key={product.id} 
                      disablePadding
                      divider
                      secondaryAction={
                        onBuy && (
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBuy(product);
                              setOpen(false);
                              setQuery('');
                            }}
                            sx={{ borderRadius: 0, fontWeight: 800 }}
                          >
                            Buy
                          </Button>
                        )
                      }
                    >
                      <ListItemButton
                        onClick={(e) => {
                            e.stopPropagation();
                            if(onSelect) onSelect(product);
                            setOpen(false);
                            setQuery('');
                        }}
                        sx={{ py: 1.5 }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            variant="square" 
                            src={product.image_path} 
                            alt={product.name}
                            sx={{ width: 48, height: 48, borderRadius: 0, border: '1px solid black' }}
                          />
                        </ListItemAvatar>
                        <ListItemText 
                          primary={<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{product.name}</Typography>} 
                          secondary={
                            <Typography component="span" variant="caption" color="text.secondary">
                              Cash: <strong>{import.meta.env.VITE_CURRENCY}{product.cash_price}</strong> • 
                              Sale: <strong>{import.meta.env.VITE_CURRENCY}{product.sale_price || 'N/A'}</strong>
                            </Typography>
                          } 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <ListItem sx={{ py: 4, justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No products found.
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          </Fade>
        </div>
      </ClickAwayListener>
    </Box>
  );
}