const API_URL = "http://localhost:5000/api";

export const getUser = async () => {
  const res = await fetch(`${API_URL}/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const logoutUser = async () => {
  await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
};