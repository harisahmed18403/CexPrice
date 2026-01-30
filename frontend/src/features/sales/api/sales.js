const API_URL = import.meta.env.VITE_API_URL;

export const createSale = async (saleData) => {
    const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
        credentials: 'include'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create sale');
    }
    return response.json();
};

export const fetchSales = async ({ limit = 50, offset = 0 } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    const response = await fetch(`${API_URL}/sales?${params.toString()}`, {
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch sales');
    }
    return response.json();
};

export const fetchSaleDetail = async (saleId) => {
    const response = await fetch(`${API_URL}/sales/${saleId}`, {
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch sale detail');
    }
    return response.json();
};

export const fetchSalesReport = async (granularity = 'daily') => {
    const response = await fetch(`${API_URL}/reports/sales?granularity=${granularity}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch sales report');
    return response.json();
};
