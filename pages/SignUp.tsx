import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icon';

type SignUpStep = 'email' | 'details';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const { sendOtp, signUp, googleSignIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine step based on location state from OTP page
  const step: SignUpStep = location.state?.from === 'otp-verified' ? 'details' : 'email';
  
  // Pre-fill email from location state if available
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendOtp(email, 'sign up');
      addToast('OTP sent to your email!', 'info');
      navigate('/otp-verify', { state: { email, from: '/signup' } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addToast(errorMessage, 'error');
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp({ email, password, firstName, lastName });
      // ...success logic...
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          errorMessage = 'User already exists';
        } else {
          errorMessage = error.message;
        }
      }
      addToast(errorMessage, 'error');
    }
  };
  
    const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await googleSignIn();
        addToast('Signed up with Google successfully!', 'success');
        navigate('/');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        addToast(errorMessage, 'error');
        setIsLoading(false);
    }
  };
  
  const renderEmailStep = () => (
     <form className="space-y-6" onSubmit={handleEmailSubmit}>
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
         <div>
          <motion.button
            type="submit"
            disabled={isLoading || !email}
            whileHover={{ scale: (isLoading || !email) ? 1 : 1.03 }}
            whileTap={{ scale: (isLoading || !email) ? 1 : 0.98 }}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            Continue
          </motion.button>
        </div>
      </form>
  );
  
  const renderDetailsStep = () => (
     <form className="space-y-6" onSubmit={handleDetailsSubmit}>
        <input type="email" name="email" value={email} readOnly className="hidden"/>
        <div className="grid grid-cols-2 gap-4">
            <input name="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all"/>
            <input name="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all"/>
        </div>
        <div className="relative">
            <Icon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create Password" className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all"/>
        </div>
         <div>
          <motion.button
            type="submit"
            disabled={isLoading || !firstName || !lastName || !password}
            whileHover={{ scale: (isLoading) ? 1 : 1.03 }}
            whileTap={{ scale: (isLoading) ? 1 : 0.98 }}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
          >
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            Create Account
          </motion.button>
        </div>
      </form>
  );

  return (
    <AuthLayout
      title="Create an account"
      subtitle={step === 'email' ? "Start by entering your email" : "Just a few more details"}
    >
      {step === 'email' ? renderEmailStep() : renderDetailsStep()}
      
       <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-500">Or sign up with</span>
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
                <span className="text-sm font-medium">Sign up with Google</span>
            </motion.button>
        </div>
      </div>
      
       <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </p>
    </AuthLayout>
  );
};

export default SignUp;
