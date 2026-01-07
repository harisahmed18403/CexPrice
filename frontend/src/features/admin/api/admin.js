export const refreshCex = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/cex-refresh`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Could not refresh");
    return res.json();
};