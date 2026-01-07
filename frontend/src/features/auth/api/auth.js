export const getUser = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const logoutUser = async () => {
  await fetch(`${import.meta.env.VITE_API_URL}/logout`, { method: "POST", credentials: "include" });
};