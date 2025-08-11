import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30">
      <nav className="bg-white/80 backdrop-blur-xl shadow-soft border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">SmartRent</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-700 font-medium">
                Welcome, {user?.name}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-100 to-secondary-100 text-primary-800 border border-primary-200">
                {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-neutral-500 hover:text-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-neutral-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="glass-card rounded-2xl h-96 flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 shadow-large animate-scale-in">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                Welcome to SmartRent Dashboard
              </h3>
              <p className="text-neutral-600 mb-6 text-lg">
                Your rental management platform is ready to use.
              </p>
              <div className="space-y-3 text-neutral-600">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  <p><span className="font-semibold">User ID:</span> {user?.id}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full"></span>
                  <p><span className="font-semibold">Email:</span> {user?.email}</p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                  <p><span className="font-semibold">Role:</span> {user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;