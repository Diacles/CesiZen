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
import EmotionTrackerPage from './pages/emotions/EmotionTrackerPage';
import EmotionStatisticsPage from './pages/emotions/EmotionStatisticsPage';
import ProfilePage from './pages/profile/ProfilePage';

// Pages d'articles
import ArticlesListPage from './pages/articles/ArticlesListPage';
import ArticleDetailPage from './pages/articles/ArticleDetailPage';

// Pages d'administration des articles
import AdminArticlesListPage from './pages/admin/ArticlesListPage';
import ArticleFormPage from './pages/admin/ArticleFormPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes d'authentification - avec layout */}
          <Route path="/login" element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          } />
          <Route path="/register" element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
          } />
          <Route path="/forgot-password" element={
            <MainLayout>
              <ForgotPasswordPage />
            </MainLayout>
          } />
          <Route path="/reset-password" element={
            <MainLayout>
              <ResetPasswordPage />
            </MainLayout>
          } />

          {/* Routes principales - avec le layout principal */}
          <Route path="/" element={
            <MainLayout>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Bienvenue sur CESIZen</h1>
                <p className="mt-4">L'application qui vous accompagne dans votre bien-être mental.</p>
              </div>
            </MainLayout>
          } />
          
          {/* Routes des articles */}
          <Route path="/articles" element={
            <MainLayout>
              <ArticlesListPage />
            </MainLayout>
          } />
          <Route path="/articles/:slug" element={
            <MainLayout>
              <ArticleDetailPage />
            </MainLayout>
          } />
          
          {/* Routes d'administration des articles */}
          <Route path="/admin/articles" element={
            <MainLayout>
              <AdminArticlesListPage />
            </MainLayout>
          } />
          <Route path="/admin/articles/new" element={
            <MainLayout>
              <ArticleFormPage />
            </MainLayout>
          } />
          <Route path="/admin/articles/edit/:id" element={
            <MainLayout>
              <ArticleFormPage />
            </MainLayout>
          } />
          
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