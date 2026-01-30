import React, { useState } from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow,
    Paper,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
    TablePagination,
    Stack,
    IconButton,
    Tooltip
} from '@mui/material';
import { Download as DownloadIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useSales, useSaleDetail } from '../../features/sales/hooks/useSales';
import { PageHeader } from '../../components/common/PageHeader';
import { useNotification } from '../../context/NotificationContext';

const SaleDetailDialog = ({ saleId, open, onClose }) => {
    const { data: sale, isLoading } = useSaleDetail(saleId);
    const currency = import.meta.env.VITE_CURRENCY || '$';

    if (!open) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: 0, border: '4px solid black' } }}
        >
            {isLoading || !sale ? (
                <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                    <CircularProgress />
                </DialogContent>
            ) : (
                <>
                    <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Transaction #{sale.id}</Typography>
                            <Chip 
                                size="small" 
                                label={sale.transaction_type.toUpperCase()} 
                                color={sale.transaction_type === 'sell' ? 'success' : sale.transaction_type === 'repair' ? 'info' : 'warning'} 
                                sx={{ fontWeight: 800, borderRadius: 0, border: '1px solid black' }}
                            />
                        </Stack>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Stack spacing={3} sx={{ py: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Date & Time</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{new Date(sale.created_at).toLocaleString()}</Typography>
                            </Box>
                            
                            {(sale.customer_name || sale.customer_email) && (
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Customer Information</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {sale.customer_name || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {[sale.customer_email, sale.customer_phone].filter(Boolean).join(' • ')}
                                    </Typography>
                                </Box>
                            )}

                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Items</Typography>
                                <List disablePadding>
                                    {sale.items.map((item, i) => (
                                        <React.Fragment key={item.id}>
                                            <ListItem sx={{ px: 0, py: 1 }}>
                                                <ListItemText 
                                                    primary={item.product_name || item.custom_product_name}
                                                    primaryTypographyProps={{ fontWeight: 600 }}
                                                    secondary={`${item.quantity} × ${currency}${item.price_per_unit}`}
                                                />
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {currency}{item.total_price}
                                                </Typography>
                                            </ListItem>
                                            {i < sale.items.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                            
                            <Box sx={{ p: 2, bgcolor: 'black', color: 'white', borderRadius: 0 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Amount Due</Typography>
                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>{currency}{sale.total_amount}</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 0, border: '2px solid black', fontWeight: 900 }}>CLOSE</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export const SalesHistoryPage = () => {
    const { showNotification } = useNotification();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const { data, isLoading } = useSales({ limit: rowsPerPage, offset: page * rowsPerPage });
    const sales = data?.items || [];
    const totalCount = data?.total || 0;
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const currency = import.meta.env.VITE_CURRENCY || '$';

    const handleExport = () => {
        if (!sales || sales.length === 0) {
            showNotification("No records available to export.", "warning");
            return;
        }
        
        try {
            const headers = ["ID", "Date", "Type", "Customer Name", "Customer Email", "Total Amount"];
            const csvContent = [
                headers.join(","),
                ...sales.map(sale => [
                    sale.id,
                    new Date(sale.created_at).toISOString(),
                    sale.transaction_type,
                    `"${sale.customer_name || ''}"`,
                    `"${sale.customer_email || ''}"`,
                    sale.total_amount
                ].join(","))
            ].join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `sales_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification("Records exported successfully.", "success");
        } catch (err) {
            showNotification("Failed to export records.", "error");
        }
    };

    return (
        <Box>
            <PageHeader 
                title="Sales History" 
                subtitle="Review and track all past transactions and inventory movements."
                action={
                    <Button 
                        variant="outlined" 
                        startIcon={<DownloadIcon />} 
                        onClick={handleExport}
                        sx={{ borderRadius: 0, fontWeight: 900, border: '2px solid black' }}
                    >
                        EXPORT SYSTEM RECORDS
                    </Button>
                }
            />

            <Paper sx={{ borderRadius: 0, border: '2px solid black', overflow: 'hidden', boxShadow: 'none' }}>
                <TableContainer>
                    <Table size="medium">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : sales.length > 0 ? (
                                sales.map((sale) => (
                                    <TableRow key={sale.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ fontWeight: 600 }}>#{sale.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={sale.transaction_type.toUpperCase()} 
                                                size="small" 
                                                color={sale.transaction_type === 'sell' ? 'success' : sale.transaction_type === 'repair' ? 'info' : 'warning'}
                                                sx={{ fontWeight: 800, borderRadius: 0, border: '1px solid black', fontSize: '0.65rem' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {sale.customer_name || 'Walk-in'}
                                            </Typography>
                                            {sale.customer_email && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {sale.customer_email}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{ fontWeight: 800 }}>
                                                {currency}{sale.total_amount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => setSelectedSaleId(sale.id)}
                                                    sx={{ color: 'black', border: '1px solid black', borderRadius: 0, '&:hover': { bgcolor: 'black', color: 'white' } }}
                                                >
                                                    <ViewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            No transaction records found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, p) => setPage(p)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    sx={{ borderTop: '1px solid', borderColor: 'divider' }}
                />
            </Paper>

            <SaleDetailDialog 
                saleId={selectedSaleId} 
                open={!!selectedSaleId} 
                onClose={() => setSelectedSaleId(null)} 
            />
        </Box>
    );
};
