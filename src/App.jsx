import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import AppLayout from './components/layout/AppLayout';

// Lazy-loaded pages for rapid initial paint & crawler responsiveness
const Dashboard = lazy(() => import('./pages/LocalBuyer/Dashboard'));
const Inventory = lazy(() => import('./pages/LocalBuyer/Inventory'));
const ConfirmOrder = lazy(() => import('./pages/LocalBuyer/ConfirmOrder'));
const Orders = lazy(() => import('./pages/LocalBuyer/Orders'));
const OrderHistory = lazy(() => import('./pages/LocalBuyer/OrderHistory'));
const Analytics = lazy(() => import('./pages/LocalBuyer/Analytics'));
const Profile = lazy(() => import('./pages/LocalBuyer/Profile'));
const CentralOrders = lazy(() => import('./pages/CentralWarehouse/CentralOrders'));

// Auth Pages
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ChangePassword = lazy(() => import('./pages/Auth/ChangePassword'));

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
        </OrdersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
