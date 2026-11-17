import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/common/ErrorBoundary';

// Resilient dynamic loader: retries once if transient 404 or CDN propagation delay occurs
function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      console.warn('[Vite dynamic chunk load retry]:', err);
      await new Promise(resolve => setTimeout(resolve, 400));
      return await factory();
    }
  });
}

// Lazy-loaded pages with automated retry for rapid initial paint & deployment resilience
const Dashboard = lazyWithRetry(() => import('./pages/LocalBuyer/Dashboard'));
const Inventory = lazyWithRetry(() => import('./pages/LocalBuyer/Inventory'));
const ConfirmOrder = lazyWithRetry(() => import('./pages/LocalBuyer/ConfirmOrder'));
const Orders = lazyWithRetry(() => import('./pages/LocalBuyer/Orders'));
const OrderHistory = lazyWithRetry(() => import('./pages/LocalBuyer/OrderHistory'));
const Analytics = lazyWithRetry(() => import('./pages/LocalBuyer/Analytics'));
const Profile = lazyWithRetry(() => import('./pages/LocalBuyer/Profile'));
const CentralOrders = lazyWithRetry(() => import('./pages/CentralWarehouse/CentralOrders'));

// Auth Pages
const Login = lazyWithRetry(() => import('./pages/Auth/Login'));
const Signup = lazyWithRetry(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazyWithRetry(() => import('./pages/Auth/ForgotPassword'));
const ChangePassword = lazyWithRetry(() => import('./pages/Auth/ChangePassword'));

import './styles/global.css';

function PageFallback() {
  return (
    <div style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 28,
          height: 28,
          border: '3px solid #F0EAEE',
          borderTopColor: '#7B2240',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#746970' }}>Loading workspace...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OrdersProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
                <Route path="/signup" element={<PublicAuthRoute><Signup /></PublicAuthRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/change-password" element={<ChangePassword />} />

                {/* Protected Application Workspace */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/create-order" element={<Navigate to="/inventory" replace />} />
                  <Route path="/recommendations" element={<Navigate to="/orders" replace />} />
                  <Route path="/confirm-order" element={<ConfirmOrder />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<Orders />} />
                  <Route path="/order-history" element={<OrderHistory />} />
                  <Route path="/history" element={<Navigate to="/order-history" replace />} />
                  <Route path="/transfers" element={<Navigate to="/inventory?tab=incoming" replace />} />
                  <Route path="/catalogue" element={<Navigate to="/inventory" replace />} />
                  <Route path="/alerts" element={<Navigate to="/" replace />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/central-orders" element={<CentralOrders />} />
                  <Route path="/central-warehouse" element={<CentralOrders />} />
                </Route>

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </OrdersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
