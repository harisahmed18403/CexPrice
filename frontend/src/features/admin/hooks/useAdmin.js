import { useState, useEffect, useRef } from "react";
import { refreshCex, fetchCexStatus } from "../api/admin";

export const useAdmin = () => {
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const pollInterval = useRef(null);

    const startPolling = () => {
        if (pollInterval.current) return;
        
        setIsLoading(true);
        pollInterval.current = setInterval(async () => {
            try {
                const s = await fetchCexStatus();
                setStatus(s);
                if (!s.is_running) {
                    stopPolling();
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 1000); // Poll every second
    };

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
    };

    // Check status on mount and cleanup on unmount
    useEffect(() => {
        const checkInitialStatus = async () => {
             try {
                const s = await fetchCexStatus();
                setStatus(s);
                if (s.is_running) {
                    startPolling();
                }
             } catch (err) {
                 console.error("Failed to fetch initial status", err);
             }
        };
        
        checkInitialStatus();
        return () => stopPolling();
    }, []);

    const refresh = async (categoryIds, productLineIds) => {
        try {
            // Check status first, maybe it's already running?
            const currentStatus = await fetchCexStatus();
            if (currentStatus.is_running) {
                startPolling();
                return;
            }

            // Start new refresh
            const data = await refreshCex(categoryIds, productLineIds);
            setResponse(data);
            startPolling();
        } catch {
            setResponse(null);
            setIsLoading(false);
        }
    };

    const stopRefresh = async () => {
        try {
            await import("../api/admin").then(m => m.stopRefreshCex());
            // We don't manually stop polling here; the poll will see is_running=false eventually and stop itself.
        } catch (err) {
            console.error("Failed to stop refresh", err);
        }
    };

    return { isLoading, refreshCex: refresh, status, stopRefresh };
};