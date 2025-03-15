import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              CESIZen
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="flex items-center text-gray-700 hover:text-blue-600"
                >
                  <User className="h-5 w-5 mr-1" />
                  {user.firstName} {user.lastName}
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Inscription
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;