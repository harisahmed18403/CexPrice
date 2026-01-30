import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';

export const MainLayout = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <Navbar /> 

      <Container 
        component="main" 
        maxWidth="xl" 
        sx={{ 
          flexGrow: 1, 
          py: { xs: 4, md: 6 }, 
          px: { xs: 2, md: 4 } 
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};