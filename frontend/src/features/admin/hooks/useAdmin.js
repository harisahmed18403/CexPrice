import { useState, useEffect } from "react";
import { refreshCex } from "../api/admin";

export const useAdmin = () => {
    const [response, setResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = async () => {
        try {
            setIsLoading(true)
            const data = await refreshCex();
            setResponse(data);
        } catch {
            setResponse(null);
        } finally {
            setIsLoading(false);
        }
    };

    return { isLoading, refreshCex: refresh };
};