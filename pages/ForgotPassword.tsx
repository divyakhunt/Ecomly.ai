import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  const { sendPasswordResetEmail } = useAuth();
  const { addToast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);
      addToast('Password reset email sent!', 'success');
      setMessageSent(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <AuthLayout
      title={!messageSent ? "Reset your password" : "Check Your Email"}
      subtitle={!messageSent ? "Enter your email to receive a password reset link." : "We've sent a secure link to help you get back into your account."}
    >
      <AnimatePresence mode="wait">
        {!messageSent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div className="relative">
                <Icon name="mail" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input 
                  id="email" name="email" type="email" autoComplete="email" required 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 placeholder-slate-500 transition-all"
                  placeholder="Your registered email"
                />
              </div>
              <div>
                <motion.button 
                  type="submit" disabled={isLoading || !email} 
                  whileHover={{ scale: (isLoading || !email) ? 1 : 1.03 }} 
                  whileTap={{ scale: (isLoading || !email) ? 1 : 0.98 }}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
                >
                  {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Icon name="send" className="w-5 h-5"/>}
                  Send Reset Link
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, scale: 0.8 }}
            variants={{ animate: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } } }}
            className="text-center space-y-4"
          >
            <motion.div className="relative w-20 h-20 mx-auto">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0, 0.4, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-0 bg-green-500 rounded-full"
              />
              <motion.div
                variants={{ initial: { scale: 0 }, animate: { scale: 1 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="relative w-full h-full bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30"
              >
                <Icon name="check-circle" className="w-10 h-10 text-green-300"/>
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="text-slate-300 pt-2 space-y-2">
            <p>
              A password reset link has been sent to <strong className="text-white font-semibold">{email}</strong>. It may take a few minutes to arrive.
            </p>
            <p className="text-sm text-slate-400 italic pt-3">
              Didn't get the email? Check your spam or junk folder.
            </p>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="mt-8 text-center text-sm text-slate-400">
        Remember your password?{' '}
        <Link to="/signin" className="font-medium text-blue-400 hover:text-blue-300">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;