
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
import AdminUsers from './pages/AdminUsers';
import AnimatedBackground from './components/AnimatedBackground';
import BrandLogo from './components/BrandLogo';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { auth } = useStore();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Updated container: Reduced padding on mobile (p-4), added overflow-x-hidden to prevent full-page scroll */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 w-full max-w-[1600px] overflow-x-hidden pb-24 md:pb-12">
        {children}
      </main>
      <MobileNav />
    </div>
  );
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { auth } = useStore();
    
    if (auth.user?.role !== UserRole.ADMIN) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}

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

            <Route path="/users" element={
                <ProtectedRoute>
                    <AdminRoute>
                        <AdminUsers />
                    </AdminRoute>
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
