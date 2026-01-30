import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../theme';
import { NotificationProvider } from '../context/NotificationContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export const AppProviders = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
};
