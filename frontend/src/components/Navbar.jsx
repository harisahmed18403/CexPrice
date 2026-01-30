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
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              MobiStore
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
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: location.pathname === item.path ? 'primary.light' : 'transparent',
                  opacity: location.pathname === item.path ? 1 : 1, // Reset opacity logic
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  '&::after': location.pathname === item.path ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '20%',
                    right: '20%',
                    height: 3,
                    bgcolor: 'primary.main',
                    borderRadius: '3px 3px 0 0'
                  } : {}
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
            sx={{ 
              borderRadius: 3,
              px: 3,
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
            }}
          >
            New Sale
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
