import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';

export const MainLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* This stays on every page */}
      <Navbar /> 

      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {/* This is where the specific Page (Dashboard, Profile, etc.) renders */}
        <Outlet />
      </Container>

      {/* You could add a Footer here too */}
    </Box>
  );
};