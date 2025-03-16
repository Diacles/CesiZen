import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setInvalidToken(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    // Valider le mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setIsLoading(true);

    try {
      // Simuler une requête API
      setTimeout(() => {
        console.log('Reset password with token:', token, 'New password length:', password.length);
        setSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Erreur lors de la réinitialisation du mot de passe. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Lien invalide</CardTitle>
              <CardDescription>
                Le lien de réinitialisation de mot de passe est invalide ou a expiré.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-md mb-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-yellow-700">
                    Veuillez demander un nouveau lien de réinitialisation.
                  </p>
                </div>
              </div>
              <a 
                href="/forgot-password" 
                className="inline-block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#00BE62] hover:bg-[#00E074]"
              >
                Demander un nouveau lien
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et en-tête */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-[#00BE62] to-[#00E074] rounded-xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Réinitialisation du mot de passe</h1>
          <p className="text-gray-600 mt-2">Créez un nouveau mot de passe sécurisé</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau mot de passe</CardTitle>
            <CardDescription>
              Choisissez un nouveau mot de passe pour votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success ? (
              <div className="p-4 bg-green-50 rounded-md">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Mot de passe réinitialisé</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/login" 
                    className="inline-block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#00BE62] hover:bg-[#00E074]"
                  >
                    Se connecter
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Nouveau mot de passe
                    </label>
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
                    <p className="text-xs text-gray-500 mt-1">
                      Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, 
                      un chiffre et un caractère spécial.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#00BE62] hover:bg-[#00E074]"
                    isLoading={isLoading}
                  >
                    {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                  </Button>
                </div>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <a href="/login" className="text-[#00BE62] hover:underline">
                    Retour à la connexion
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;