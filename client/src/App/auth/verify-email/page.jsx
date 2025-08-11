import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../../contexts/AuthContext';
import AuthLayout from '../layout';

const verifyEmailSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendOTP, error, clearError, loading } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  const userEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
  });

  const otpValue = watch('otp', '');

  // Redirect if no email provided
  useEffect(() => {
    if (!userEmail) {
      navigate('/auth/login', { replace: true });
    }
  }, [userEmail, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data) => {
    const result = await verifyEmail({ email: userEmail, otp: data.otp });
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    const result = await resendOTP(userEmail);
    if (result.success) {
      setResendMessage('OTP sent successfully!');
      setCountdown(60); // 60 second cooldown
    } else {
      setResendMessage(result.error || 'Failed to resend OTP');
    }
    
    setResendLoading(false);
    setTimeout(() => setResendMessage(''), 5000);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email"
      linkText="Want to use a different email?"
      linkTo="/auth/signup"
      linkLabel="Sign up again"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {resendMessage && !error && (
          <div className="bg-green-50/80 border border-green-200 text-green-700 px-4 py-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{resendMessage}</span>
            </div>
          </div>
        )}

        {/* Email Display */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            We sent a verification code to
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {userEmail}
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-2">
          <label htmlFor="otp" className="block text-sm font-semibold text-slate-700">
            Verification Code
          </label>
          <div className="relative">
            <input
              {...register('otp')}
              type="text"
              id="otp"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/50 backdrop-blur-sm placeholder-slate-400 text-slate-900"
              placeholder="000000"
              autoComplete="one-time-code"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center space-x-2">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < otpValue.length
                  ? 'bg-blue-500 scale-110'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading || otpValue.length !== 6}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex justify-center items-center"
        >
          {isSubmitting || loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Email
            </>
          )}
        </button>

        {/* Resend OTP */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-3">
            Didn't receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading || countdown > 0}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-300 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              'Sending...'
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>Check your spam folder if you don't see the email</p>
          <p>The code will expire in 10 minutes</p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmailPage;