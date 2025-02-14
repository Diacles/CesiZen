import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/profile/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/" element={
      <PrivateRoute>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </PrivateRoute>
    } />
    <Route path="/profile" element={
      <PrivateRoute>
        <MainLayout>
          <ProfilePage />
        </MainLayout>
      </PrivateRoute>
    } />
  </Routes>
)

export default AppRoutes;