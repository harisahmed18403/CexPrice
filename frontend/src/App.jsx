import { AppRouter } from "./routes";
import { CssBaseline } from "@mui/material";

function App() {
  return (
    <>
      <CssBaseline /> {/* Standardizes MUI styles */}
      <AppRouter />
    </>
  );
}

export default App;