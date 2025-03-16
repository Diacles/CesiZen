import React, { useState } from 'react';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      // Simuler une requête API
      setTimeout(() => {
        console.log('Reset password request for:', email);
        setSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Erreur lors de la demande de réinitialisation. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo et en-tête */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-[#00BE62] to-[#00E074] rounded-xl mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Réinitialisation du mot de passe</h1>
          <p className="text-gray-600 mt-2">Récupérez l'accès à votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre adresse email pour recevoir un lien de réinitialisation
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
                    <h4 className="font-medium text-green-800">Email envoyé</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="/login" 
                    className="inline-block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#00BE62] hover:bg-[#00E074]"
                  >
                    Retour à la connexion
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
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

                  <Button
                    type="submit"
                    className="w-full bg-[#00BE62] hover:bg-[#00E074]"
                    isLoading={isLoading}
                  >
                    {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
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

export default ForgotPasswordPage;