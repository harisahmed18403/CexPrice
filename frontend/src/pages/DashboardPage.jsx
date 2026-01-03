import { useAuth } from "../features/auth";
import { Container, Box, Typography, Button } from "@mui/material";

export const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth();

  // 1. Prevent rendering the UI until we know if the user is logged in
  if (isLoading) {
    return null; // Or <CircularProgress />
  }

  // 2. Extra safety check: If for some reason loading finished but user is still null
  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        {/* Now user.username is guaranteed to exist */}
        <Typography variant="h4">Welcome, {user.username}</Typography>
        <Button onClick={logout} variant="contained">Logout</Button>
      </Box>
    </Container>
  );
};