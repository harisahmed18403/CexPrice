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
              <Box sx={{ 
                p: 2, 
                borderRadius: 0, 
                bgcolor: 'black', 
                color: 'white',
                border: '4px solid black'
              }}>
                <SmartphoneIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, mb: 0.5 }}>
                  {import.meta.env.VITE_APP_NAME || 'Phoneworks'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Advanced Inventory Management
                </Typography>
              </Box>
            </Stack>

            <Paper elevation={0} sx={{ 
              p: { xs: 3, sm: 4 }, 
              borderRadius: 0, 
              border: '2px solid black',
              boxShadow: 'none'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                System Access
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center', fontWeight: 700 }}>
                CRITICAL INVENTORY CONTROL
              </Typography>
              
              <LoginForm onLogin={refreshUser} />
            </Paper>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_NAME || 'Phoneworks'} Inventory System. All rights reserved.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};