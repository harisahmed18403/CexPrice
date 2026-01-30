const API_URL = import.meta.env.VITE_API_URL;

export const fetchProducts = async ({ 
    category_id, 
    product_line_id, 
    super_category_id, 
    page = 1, 
    limit = 24,
    sort_by = 'name',
    order = 'asc',
    search = ''
}) => {
    const params = new URLSearchParams();
    if (category_id) params.append('category_id', category_id);
    if (product_line_id) params.append('product_line_id', product_line_id);
    if (super_category_id) params.append('super_category_id', super_category_id);
    
    params.append('page', page);
    params.append('limit', limit);
    params.append('sort_by', sort_by);
    params.append('order', order);
    if (search) params.append('search', search);

    const response = await fetch(`${API_URL}/products?${params.toString()}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
};

export const fetchNavigation = async (includeInactive = false) => {
    const response = await fetch(`${API_URL}/navigation?include_inactive=${includeInactive}`, {
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch navigation');
    return response.json();
};

export const toggleCategory = async (id) => {
    const response = await fetch(`${API_URL}/categories/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to toggle category');
    return response.json();
};

export const toggleSuperCategory = async (id) => {
    const response = await fetch(`${API_URL}/super-categories/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to toggle super category');
    return response.json();
};