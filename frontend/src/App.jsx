import { AppRouter } from "./routes";
import { AppProviders } from "./providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}

export default App;