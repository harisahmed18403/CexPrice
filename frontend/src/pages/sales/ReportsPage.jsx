import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Card, 
    CardContent, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Divider
} from '@mui/material';
import { fetchSalesReport } from '../../features/sales/api/sales';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export const ReportsPage = () => {
    const [granularity, setGranularity] = useState('daily');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReport = async () => {
            setLoading(true);
            try {
                const reportData = await fetchSalesReport(granularity);
                setData(reportData);
            } catch (err) {
                console.error("Failed to load report", err);
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [granularity]);

    const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalTransactions = data.reduce((acc, curr) => acc + curr.count, 0);
    const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Sales Reports</Typography>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Granularity</InputLabel>
                    <Select
                        value={granularity}
                        onChange={(e) => setGranularity(e.target.value)}
                        label="Granularity"
                    >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountBalanceWalletIcon fontSize="large" />
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Revenue</Typography>
                                <Typography variant="h4">{import.meta.env.VITE_CURRENCY}{totalRevenue.toFixed(2)}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ReceiptIcon fontSize="large" />
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Transactions</Typography>
                                <Typography variant="h4">{totalTransactions}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TrendingUpIcon fontSize="large" />
                            <Box>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Avg. Transaction</Typography>
                                <Typography variant="h4">{import.meta.env.VITE_CURRENCY}{avgTransactionValue.toFixed(2)}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
                <Typography variant="h6" sx={{ p: 2, bgcolor: 'background.paper' }}>
                    Sales Breakdown ({granularity})
                </Typography>
                <Divider />
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Period</TableCell>
                                <TableCell align="right">Transactions</TableCell>
                                <TableCell align="right">Revenue</TableCell>
                                <TableCell align="right">Avg. Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((row) => (
                                    <TableRow key={row.period} hover>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{row.period}</TableCell>
                                        <TableCell align="right">{row.count}</TableCell>
                                        <TableCell align="right">{import.meta.env.VITE_CURRENCY}{row.revenue.toFixed(2)}</TableCell>
                                        <TableCell align="right">{import.meta.env.VITE_CURRENCY}{(row.revenue / row.count).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        No data found for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};
