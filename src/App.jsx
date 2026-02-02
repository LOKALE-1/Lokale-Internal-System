import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Lazy load modules
const Dashboard = lazy(() => import('./modules/Dashboard'));
const TaskManagement = lazy(() => import('./modules/TaskManagement'));
const GrowthCampaigns = lazy(() => import('./modules/GrowthCampaigns'));
const BrandOnboarding = lazy(() => import('./modules/BrandOnboarding'));
const Partnerships = lazy(() => import('./modules/Partnerships'));
const ITBoard = lazy(() => import('./modules/ITBoard'));
const ProjectManagement = lazy(() => import('./modules/ProjectManagement'));
const Login = lazy(() => import('./modules/Login'));
const Signup = lazy(() => import('./modules/Signup'));

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-secondary)'
    }}>Verifying Identity...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const Layout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return children;

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Suspense fallback={<div className="loading">Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Suspense fallback={null}><Login /></Suspense>} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Suspense fallback={null}><Signup /></Suspense>} />

      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MARKETING, ROLES.PARTNERSHIPS, ROLES.IT]}>
          <TaskManagement />
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MARKETING, ROLES.PARTNERSHIPS, ROLES.IT]}>
          <ProjectManagement />
        </ProtectedRoute>
      } />

      <Route path="/growth" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MARKETING]}>
          <GrowthCampaigns />
        </ProtectedRoute>
      } />

      <Route path="/onboarding" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PARTNERSHIPS]}>
          <BrandOnboarding />
        </ProtectedRoute>
      } />

      <Route path="/partnerships" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.PARTNERSHIPS]}>
          <Partnerships />
        </ProtectedRoute>
      } />

      <Route path="/it-board" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.IT]}>
          <ITBoard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
