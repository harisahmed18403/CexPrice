import { useState, useEffect, useCallback } from "react";
import { getUser, logoutUser } from "../api/auth";
import { useNotification } from "../../../context/NotificationContext";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useNotification();

  const fetchMe = useCallback(async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      showError("Failed to logout");
    }
  };

  return { user, isLoading, logout, refreshUser: fetchMe };
};