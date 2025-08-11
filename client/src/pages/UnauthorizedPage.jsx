import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-red-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center animate-fade-in">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-large animate-scale-in">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {/* <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /> */}
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-neutral-900 mb-4">Access Denied</h2>
          <p className="text-neutral-600 mb-10 text-lg">
            You don't have permission to access this resource.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;