import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/router/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import AppRoutes from './routes';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RequestResetPage from './pages/auth/RequestResetPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/profile/ProfilePage';
import HomePage from './pages/HomePage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<RequestResetPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Routes protégées */}
          <Route element={<MainLayout />}>
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;