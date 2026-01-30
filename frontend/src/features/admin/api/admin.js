export const fetchCexStatus = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cex-refresh/status`, {
        method: "GET",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Could not fetch status");
    return res.json();
};

export const refreshCex = async (categoryIds = [], productLineIds = []) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cex-refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ 
            category_ids: categoryIds,
            product_line_ids: productLineIds
        })
    });
    return res.json();
};

export const stopRefreshCex = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cex-refresh/stop`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Could not stop refresh");
    return res.json();
};