import React, { useState } from 'react';
import { User, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api/Service';
import { triggerAuthEvent } from '../../utils/authEvents';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Attempting login...');

    try {
      const response = await apiService.login(email, password);
      console.log('Login response:', response);
      
      if (response.success) {
        console.log('Login successful, token saved');
        
        // Vérification explicite que localStorage a bien le token
        const token = localStorage.getItem('token');
        if (!token && response.token) {
          // Backup en cas d'échec dans le service
          localStorage.setItem('token', response.token);
          console.log('Token manually set in localStorage');
        }
        
        // Si l'option "Se souvenir de moi" est cochée
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Important: Déclencher l'événement d'authentification
        triggerAuthEvent(true);
        console.log('Auth-change event dispatched');
        
        // Petit délai pour s'assurer que tout est bien mis à jour
        setTimeout(() => {
          // Redirection vers le dashboard après connexion réussie
          navigate('/dashboard');
        }, 100);
      } else {
        setError(response.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-[#00BE62] to-[#00E074] rounded-xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Connexion à CESIZen</h1>
          <p className="text-gray-600 mt-2">Accédez à votre espace personnel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connectez-vous</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    <a href="/forgot-password" className="text-sm text-[#00BE62] hover:underline">
                      Mot de passe oublié ?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-[#00BE62] focus:ring-[#00BE62] border-gray-300 rounded"
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm font-medium text-gray-700">
                    Se souvenir de moi
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#00BE62] hover:bg-[#00E074]"
                  isLoading={isLoading}
                >
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous n'avez pas de compte ?{' '}
                <a href="/register" className="text-[#00BE62] hover:underline">
                  Créer un compte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;