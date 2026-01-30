import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchNavigation } from '../api/products';

export const useProducts = (filters) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
    });
};

export const useNavigation = () => {
    return useQuery({
        queryKey: ['navigation'],
        queryFn: () => fetchNavigation(),
    });
};