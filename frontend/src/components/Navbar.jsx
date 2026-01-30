import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, Stack } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'Sales History', path: '/sales/history' },
    { label: 'Admin', path: '/admin' },
  ];

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
          <Stack direction="row" spacing={1} alignItems="center" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'primary.main' }}>
            <SmartphoneIcon />
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: 'text.primary' }}>
              {import.meta.env.VITE_APP_NAME || 'Phoneworks'}
            </Typography>
          </Stack>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: 700,
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      color: 'primary.main',
                    },
                  }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/sales/new"
            color="success"
            sx={{ 
              borderRadius: 1.5,
              px: 3,
              fontWeight: 800,
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
              '&:hover': {
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
              }
            }}
          >
            New Sale
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
