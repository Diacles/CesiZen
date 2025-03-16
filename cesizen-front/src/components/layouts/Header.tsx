import React, { useState } from 'react';
import { User, Menu, X, LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // À remplacer par votre logique d'authentification
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-2">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CESIZen</span>
          </a>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-600 hover:text-primary transition">Accueil</a>
            <a href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</a>
            <a href="/emotions" className="text-gray-600 hover:text-primary transition">Émotions</a>
            <a href="/articles" className="text-gray-600 hover:text-primary transition">Articles</a>
          </nav>

          {/* Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                  <User className="w-5 h-5" />
                  <span>Mon compte</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User className="w-4 h-4 inline mr-2" />
                    Mon profil
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Paramètres
                  </a>
                  <hr className="my-1" />
                  <button 
                    onClick={() => console.log('Logout clicked')} 
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <>
                <a href="/login" className="text-gray-700 hover:text-primary transition">Connexion</a>
                <a 
                  href="/register" 
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition"
                >
                  S'inscrire
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <nav className="flex flex-col space-y-3">
              <a href="/" className="text-gray-600 hover:text-primary transition">Accueil</a>
              <a href="/dashboard" className="text-gray-600 hover:text-primary transition">Dashboard</a>
              <a href="/emotions" className="text-gray-600 hover:text-primary transition">Émotions</a>
              <a href="/articles" className="text-gray-600 hover:text-primary transition">Articles</a>
              
              {isLoggedIn ? (
                <>
                  <a href="/profile" className="text-gray-600 hover:text-primary transition">
                    <User className="w-4 h-4 inline mr-2" />
                    Mon profil
                  </a>
                  <a href="/settings" className="text-gray-600 hover:text-primary transition">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Paramètres
                  </a>
                  <button 
                    onClick={() => console.log('Logout clicked')} 
                    className="text-left text-red-600 hover:text-red-700 transition"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <a href="/login" className="text-gray-700 hover:text-primary transition">Connexion</a>
                  <a 
                    href="/register" 
                    className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition text-center"
                  >
                    S'inscrire
                  </a>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;