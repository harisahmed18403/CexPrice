import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Paper, Typography, Stack, Fade } from '@mui/material';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { LoginForm, useAuth } from '../features/auth';

export const LoginPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      bgcolor: 'grey.50',
      py: 4
    }}>
      <Container maxWidth="xs">
        <Fade in timeout={800}>
          <Box>
            <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 3, 
                bgcolor: 'primary.main', 
                color: 'white',
                boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
              }}>
                <SmartphoneIcon sx={{ fontSize: 40 }} />
              </Paper>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, mb: 0.5 }}>
                  MobiStore
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Advanced Inventory Management
                </Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ 
              p: { xs: 3, sm: 4 }, 
              borderRadius: 4, 
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, textAlign: 'center' }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontWeight: 500 }}>
                Please sign in to your account
              </Typography>
              
              <LoginForm onLogin={refreshUser} />
            </Paper>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} MobiStore Inventory System. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};