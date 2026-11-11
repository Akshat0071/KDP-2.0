import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/LocalBuyer/Dashboard';
import Inventory from './pages/LocalBuyer/Inventory';
import ConfirmOrder from './pages/LocalBuyer/ConfirmOrder';
import Orders from './pages/LocalBuyer/Orders';
import Analytics from './pages/LocalBuyer/Analytics';
import Profile from './pages/LocalBuyer/Profile';
import CentralOrders from './pages/CentralWarehouse/CentralOrders';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChangePassword from './pages/Auth/ChangePassword';

import './styles/global.css';

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
        </OrdersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
