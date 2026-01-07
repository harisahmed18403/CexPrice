import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, Snackbar } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAdmin } from '../features/admin/hooks/useAdmin';
export const AdminPage = () => {
    const { isLoading, refreshCex } = useAdmin();
    const [open, setOpen] = useState(false);

    const handleRefresh = async () => {
        await refreshCex();
        setOpen(true); // Show success message when done
    };

    return (
        <Box sx={{ maxWidth: 500, m: 4 }}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Data Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Trigger a manual synchronization with the Central Exchange. 
                        This process may take several seconds.
                    </Typography>

                    <LoadingButton
                        size="large"
                        onClick={handleRefresh}
                        loading={isLoading}
                        loadingPosition="start"
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        fullWidth
                    >
                        <span>Refresh CEX Data</span>
                    </LoadingButton>
                </CardContent>
            </Card>

            <Snackbar 
                open={open} 
                autoHideDuration={6000} 
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
                    CEX Data refreshed successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};