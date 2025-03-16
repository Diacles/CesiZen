import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1">
            <a href="/" className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CESIZen</span>
            </a>
            <p className="text-gray-600 text-sm">
              CESIZen vous accompagne au quotidien pour améliorer votre bien-être mental et suivre vos émotions.
            </p>
          </div>

          {/* Liens rapides */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-600 hover:text-primary transition text-sm">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-600 hover:text-primary transition text-sm">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/emotions" className="text-gray-600 hover:text-primary transition text-sm">
                  Tracker d'émotions
                </a>
              </li>
              <li>
                <a href="/articles" className="text-gray-600 hover:text-primary transition text-sm">
                  Articles
                </a>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/faq" className="text-gray-600 hover:text-primary transition text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/help" className="text-gray-600 hover:text-primary transition text-sm">
                  Aide
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-600 hover:text-primary transition text-sm">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-600 hover:text-primary transition text-sm">
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-gray-600 text-sm">93 Bd de la Seine, 92000 Nanterre</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+33123456789" className="text-gray-600 hover:text-primary transition text-sm">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:contact@cesizen.fr" className="text-gray-600 hover:text-primary transition text-sm">
                  contact@cesizen.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright et crédits */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} CESIZen. Tous droits réservés.
          </p>
          <p className="text-gray-600 text-sm mt-2 md:mt-0">
            Fait avec <Heart className="w-4 h-4 text-red-500 inline mx-1" /> par le Ministère de la Santé
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;