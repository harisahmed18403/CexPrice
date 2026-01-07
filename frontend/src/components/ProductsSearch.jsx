import React, { useState, useEffect, useRef } from 'react';
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
  Typography
} from '@mui/material';

export default function ProductsSearch({onSelect}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Search Logic encapsulated inside the component
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
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
    }, 300); // 300ms Debounce to prevent API spam

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <div>
          <TextField
            fullWidth
            size="small"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length > 2 && setOpen(true)}
            InputProps={{
              endAdornment: loading ? <CircularProgress size={20} /> : null,
            }}
          />

          {/* Results Dropdown */}
          {open && (
            <Paper 
              elevation={8} 
              sx={{ 
                position: 'absolute', 
                top: '110%', 
                left: 0, 
                right: 0, 
                zIndex: 10,
                maxHeight: 400,
                overflowY: 'auto'
              }}
            >
              <List>
                {results.length > 0 ? (
                  results.map((product) => (
                    <ListItem 
                      button 
                      key={product.id} 
                      onClick={() => {
                          console.log("Selected:", product.id, product.name);
                          onSelect(product)
                        setOpen(false);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          variant="rounded" 
                          src={product.image_path} 
                          alt={product.name} 
                        />
                      </ListItemAvatar>
                      <ListItemText 
                        primary={product.name} 
                        secondary={`$${product.cash_price}`} 
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <Typography variant="body2" color="text.secondary">
                      No products found.
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Paper>
          )}
        </div>
      </ClickAwayListener>
    </Box>
  );
}