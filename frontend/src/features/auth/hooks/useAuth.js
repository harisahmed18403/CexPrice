import { useState, useEffect } from "react";
import { getUser, logoutUser } from "../api/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const data = await getUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMe(); }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return { user, isLoading, logout, refreshUser: fetchMe };
};