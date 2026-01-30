import React, { useEffect, useState } from 'react';
import { useAuth } from "../features/auth";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  CircularProgress,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip
} from "@mui/material";
import ProductsSearch from "../components/ProductsSearch";
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';

export const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchStats();
    }
  }, [user]);

  const handleBuy = (product) => {
      navigate('/sales/new', { state: { product } });
  };

  if (isLoading) return null;
  if (!user) return null;

  return (
    <Box>
      <PageHeader 
        title={`Welcome back, ${user.username}`}
        subtitle="Here's what's happening with your store today."
        action={
          <Stack direction="row" spacing={2}>
            <Tooltip title="Refresh Stats">
              <IconButton onClick={fetchStats} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" color="error" onClick={logout}>Logout</Button>
          </Stack>
        }
      />

      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            bgcolor: 'black',
            color: 'white',
            borderRadius: 0,
            border: '2px solid black'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: '0.1em' }}>REVENUE TOTAL</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>
                    {import.meta.env.VITE_CURRENCY}{stats?.total_sales?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.5 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            borderRadius: 0,
            border: '2px solid black',
            bgcolor: 'white'
          }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.1em' }}>TRANSACTION COUNT</Typography>
                  <Typography variant="h3" color="text.primary" sx={{ fontWeight: 900 }}>
                    {stats?.sale_count || 0}
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 40, color: 'black', opacity: 1 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 0, border: '2px solid black' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 900, textTransform: 'uppercase' }}>Terminal Search</Typography>
          <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontWeight: 600 }}>
            ENTER PRODUCT SKU OR NAME FOR NEW TRANSACTION
          </Typography>
          <ProductsSearch onBuy={handleBuy} />
        </Paper>
      </Box>
    </Box>
  );
};