import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label,
  error,
  className = '',
  ...props
}, ref) => {
  const id = props.id || props.name;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          block w-full rounded-md
          border border-gray-300
          px-3 py-2
          text-gray-900 placeholder-gray-500
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:opacity-50
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;