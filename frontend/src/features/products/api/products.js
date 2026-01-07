const API_URL = import.meta.env.VITE_API_URL;

export const fetchProducts = async ({ category_id, product_line_id, super_category_id }) => {
    const params = new URLSearchParams();
    if (category_id) params.append('category_id', category_id);
    if (product_line_id) params.append('product_line_id', product_line_id);
    if (super_category_id) params.append('super_category_id', super_category_id);

    const response = await fetch(`${API_URL}/products?${params.toString()}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
};

export const fetchNavigation = async () => {
    const response = await fetch(`${API_URL}/navigation`);
    if (!response.ok) throw new Error('Failed to fetch navigation');
    return response.json();
};