import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import { AuthProvider } from './contexts/AuthContext';

// Pages d'authentification
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Pages principales
// Importer d'autres pages au fur et à mesure que nous les créons
// import Dashboard from './pages/dashboard/Dashboard';
// import EmotionTracker from './pages/emotions/EmotionTracker';
import EmotionTrackerPage from './pages/emotions/EmotionTrackerPage';
import EmotionStatisticsPage from './pages/emotions/EmotionStatisticsPage';

import ProfilePage from './pages/profile/ProfilePage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes d'authentification - sans le layout principal */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Routes principales - avec le layout principal */}
          <Route path="/" element={
            <MainLayout>
              {/* La page d'accueil sera importée ici quand elle sera prête */}
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Bienvenue sur CESIZen</h1>
                <p className="mt-4">L'application qui vous accompagne dans votre bien-être mental.</p>
              </div>
            </MainLayout>
          } />

          {/* Ajouter d'autres routes au fur et à mesure du développement */}
          {/* Exemple:
          <Route path="/dashboard" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />
          */}
          
          <Route path="/profile" element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          } />

          <Route path="/emotions" element={
            <MainLayout>
              <EmotionTrackerPage />
            </MainLayout>
          } />

          <Route path="/emotions/statistics" element={
            <MainLayout>
              <EmotionStatisticsPage />
            </MainLayout>
          } />

          {/* Route 404 */}
          <Route path="*" element={
            <MainLayout>
              <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                <a href="/" className="bg-primary hover:bg-secondary text-black px-4 py-2 rounded-lg transition">
                  Retour à l'accueil
                </a>
              </div>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;