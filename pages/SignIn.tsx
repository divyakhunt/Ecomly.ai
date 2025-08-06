import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icon';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, googleSignIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      addToast('Welcome back!', 'success');
      navigate(redirectPath, { replace: true });
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message.includes('auth/invalid-credential')) {
          errorMessage = 'Invalid or expired credentials. Please try again.';
        } else if (error.message.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('auth/weak-password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('auth/internal-error')) {
          errorMessage = 'Internal server error. Please try again later.';
        } else if (error.message.includes('auth/operation-not-allowed')) {
          errorMessage = 'Sign up is currently disabled. Please contact support.';
        } else if (error.message.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email.';
        } else if (error.message.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password.';
        } else if (error.message.includes('auth/too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.message.includes('auth/popup-closed-by-user')) {
          errorMessage = 'Google sign-in was cancelled.';
        } else {
          errorMessage = error.message;
        }
      }
      addToast(errorMessage, 'error');
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await googleSignIn();
        addToast('Signed in with Google successfully!', 'success');
        navigate(redirectPath, { replace: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        addToast(errorMessage, 'error');
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="to continue to Ecomly.ai"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="relative">
            <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all duration-300"
              placeholder="Email address"
            />
        </div>

        <div className="relative">
            <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all duration-300"
              placeholder="Password"
            />
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            Sign In
          </motion.button>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
            <motion.button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.03 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-slate-800/60 border border-slate-700/50 rounded-md transition-colors hover:border-slate-600 hover:bg-slate-800/80 text-slate-300 disabled:opacity-50"
            >
                <Icon name="google" className="w-5 h-5" />
                <span className="text-sm font-medium">Sign in with Google</span>
            </motion.button>
        </div>
      </div>
      
       <p className="mt-8 text-center text-sm text-slate-400">
          Not a member?{' '}
          <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
            Sign up now
          </Link>
        </p>
    </AuthLayout>
  );
};

export default SignIn;
