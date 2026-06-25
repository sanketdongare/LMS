'use client';
import { store } from '@/store/store';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './AuthProvider';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0891b2', light: '#22d3ee', dark: '#0e7490' },
    secondary: { main: '#0d9488', light: '#2dd4bf', dark: '#0f766e' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#0891b2' },
    divider: 'rgba(8, 145, 178, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
        },
        contained: {
          background: 'linear-gradient(135deg, #0891b2, #0d9488)',
          boxShadow: '0 4px 15px rgba(8, 145, 178, 0.25)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #0e7490, #0f766e)',
            boxShadow: '0 6px 20px rgba(8, 145, 178, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#ffffff',
          border: '1px solid rgba(8, 145, 178, 0.15)',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          borderRight: '1px solid rgba(8, 145, 178, 0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(8, 145, 178, 0.15)',
          boxShadow: 'none',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: '#ffffff',
          border: '1px solid rgba(8, 145, 178, 0.12)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(8, 145, 178, 0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(8, 145, 178, 0.6)' },
            '&.Mui-focused fieldset': { borderColor: '#0891b2' },
          },
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(8, 145, 178, 0.3)',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </ThemeProvider>
    </Provider>
  );
}
