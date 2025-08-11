import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/AuthLayout';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join SmartRent and start managing rentals"
      linkText="Already have an account?"
      linkTo="/login"
      linkLabel="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl animate-slide-up shadow-soft">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-3">
            Full name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="input-field"
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="form-error">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-3">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input-field"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-3">
            Password
          </label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="input-field pr-12"
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg
                className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700 mb-3">
            Confirm password
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="input-field pr-12"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <svg
                className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showConfirmPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded transition-colors duration-200"
          />
          <label htmlFor="terms" className="ml-3 block text-sm text-neutral-700">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors duration-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors duration-300">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;