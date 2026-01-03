import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Paper, Typography } from '@mui/material';
import { LoginForm, useAuth } from '../features/auth';

export const LoginPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // If the user is already logged in, send them to the dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Welcome Back
          </Typography>
          {/* We pass refreshUser as the onLogin callback */}
          <LoginForm onLogin={refreshUser} />
        </Paper>
      </Box>
    </Container>
  );
};