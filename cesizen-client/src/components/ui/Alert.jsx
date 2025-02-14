import React from 'react';
import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

const variants = {
  success: {
    base: 'bg-green-50 text-green-800',
    icon: CheckCircle2,
    iconClass: 'text-green-400'
  },
  error: {
    base: 'bg-red-50 text-red-800',
    icon: XCircle,
    iconClass: 'text-red-400'
  },
  warning: {
    base: 'bg-yellow-50 text-yellow-800',
    icon: AlertCircle,
    iconClass: 'text-yellow-400'
  },
  info: {
    base: 'bg-blue-50 text-blue-800',
    icon: Info,
    iconClass: 'text-blue-400'
  }
};

const Alert = ({
  title,
  message,
  variant = 'info',
  onClose,
  className = ''
}) => {
  const { base, icon: Icon, iconClass } = variants[variant];

  return (
    <div className={`rounded-md p-4 ${base} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          {message && (
            <p className="text-sm mt-1">{message}</p>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Fermer</span>
              <XCircle className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;