import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getProfile } from './db/database';
import { ThemeProvider } from './context/ThemeContext';
import OnboardingPage from './pages/OnboardingPage';
import TodayPage from './pages/TodayPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10_000, retry: 1 },
  },
});

function AppRoutes() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    getProfile().then(p => {
      setOnboarded(p?.onboardingComplete ?? false);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="app-screen flex items-center justify-center min-h-screen">
        <div
          className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--app-brand)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/log" element={<TodayPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to={onboarded ? '/log' : '/onboarding'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
