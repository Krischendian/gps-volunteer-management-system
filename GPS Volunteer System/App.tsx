
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './contexts/StoreContext';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LogHours from './pages/LogHours';
import Activities from './pages/Activities';
import Orientation from './pages/Orientation';
import AnimatedBackground from './components/AnimatedBackground';
import BrandLogo from './components/BrandLogo';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { auth } = useStore();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-12 max-w-[1600px]">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

const AppRoutes = () => {
    const { auth } = useStore();

    return (
        <Routes>
            <Route path="/login" element={auth.isAuthenticated ? <Navigate to="/" /> : <Auth />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/log-hours" element={
                <ProtectedRoute>
                    <LogHours />
                </ProtectedRoute>
            } />
            
            <Route path="/activities" element={
                <ProtectedRoute>
                    <Activities />
                </ProtectedRoute>
            } />
            
            <Route path="/orientation" element={
                <ProtectedRoute>
                    <Orientation />
                </ProtectedRoute>
            } />
        </Routes>
    );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="relative min-h-screen gradient-bg">
            <AnimatedBackground />
            <AppRoutes />
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;