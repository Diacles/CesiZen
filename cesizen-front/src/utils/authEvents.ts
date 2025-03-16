// Événement personnalisé pour la gestion de l'authentification
export const AUTH_EVENT_NAME = 'auth-status-change';

// Déclencher l'événement d'authentification
export const triggerAuthEvent = (isLoggedIn: boolean) => {
  console.log('Triggering auth event, isLoggedIn:', isLoggedIn);
  const event = new CustomEvent(AUTH_EVENT_NAME, { 
    detail: { isLoggedIn } 
  });
  window.dispatchEvent(event);
};

// Hook personnalisé pour écouter les événements d'authentification
export const listenToAuthEvents = (callback: (isLoggedIn: boolean) => void) => {
  const handleAuthEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Auth event received:', customEvent.detail);
    callback(customEvent.detail.isLoggedIn);
  };

  window.addEventListener(AUTH_EVENT_NAME, handleAuthEvent);
  
  // Fonction de nettoyage
  return () => {
    window.removeEventListener(AUTH_EVENT_NAME, handleAuthEvent);
  };
};

// Vérifier si l'utilisateur est authentifié
export const checkIsAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};