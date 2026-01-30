import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSale, fetchSales, fetchSaleDetail } from '../api/sales';
import { useNotification } from '../../../context/NotificationContext';

export const useCreateSale = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    
    return useMutation({
        mutationFn: createSale,
        onSuccess: () => {
            queryClient.invalidateQueries(['sales']);
            showSuccess('Transaction completed successfully!');
        },
        onError: (error) => {
            showError(error.message || 'Failed to complete transaction');
        }
    });
};

export const useSales = (params) => {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: () => fetchSales(params),
    });
};

export const useSaleDetail = (saleId) => {
    return useQuery({
        queryKey: ['sale', saleId],
        queryFn: () => fetchSaleDetail(saleId),
        enabled: !!saleId,
    });
};
