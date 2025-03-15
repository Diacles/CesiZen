import React from 'react';
import { Link } from 'react-router-dom';
import { RequestResetForm } from '../../components/auth/RequestResetForm';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';

const RequestResetPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Réinitialisation du mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-gray-600 text-center">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
          </div>
          <RequestResetForm />
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestResetPage;
