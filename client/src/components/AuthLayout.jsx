import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, linkText, linkTo, linkLabel }) => {
  return (
    <div className="min-h-screen w-full bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-sm font-semibold tracking-widest text-neutral-500">SMARTRENT</h1>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">{title}</h2>
          <p className="mt-2 text-neutral-600">{subtitle}</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xl p-8">
          {children}

          {linkText && (
            <div className="mt-8 text-center">
              <p className="text-neutral-600">
                {linkText}{' '}
                <Link
                  to={linkTo}
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-300 hover:underline"
                >
                  {linkLabel}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;