import { BrowserRouter as Router } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes } from './routes/Routes.jsx';
import { AuthProvider } from "./hooks/useAuth";
import { HomeProvider } from './hooks/useHome.js';

const queryClient = new QueryClient()

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <Router>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HomeProvider>
              <Routes />
            </HomeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App;
