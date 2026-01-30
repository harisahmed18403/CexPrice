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
            <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em', textTransform: 'uppercase' }}>
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
                    color: location.pathname === item.path ? 'common.black' : 'text.secondary',
                    fontWeight: 700,
                    px: 2,
                    py: 1,
                    borderRadius: 0,
                    bgcolor: 'transparent',
                    position: 'relative',
                    borderBottom: location.pathname === item.path ? '3px solid black' : '3px solid transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderRadius: 0,
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
            sx={{ 
              borderRadius: 0,
              px: 3,
              fontWeight: 800,
              border: '2px solid black',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'white',
                color: 'black',
                boxShadow: 'none'
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
