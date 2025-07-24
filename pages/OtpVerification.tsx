import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import AuthLayout from '../components/AuthLayout';
import { Icon } from '../components/Icon';

const OTP_LENGTH = 6;

const OtpVerification: React.FC = () => {
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOtp, sendOtp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const { email, from } = location.state || {};

  useEffect(() => {
    if (!email || !from) {
      addToast("Invalid access to this page.", "error");
      navigate('/signup');
    }
    inputRefs.current[0]?.focus();
  }, [email, from, navigate, addToast]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const finalOtp = otp.join("");
    if (finalOtp.length !== OTP_LENGTH) {
      addToast("Please enter the complete OTP.", "error");
      setIsLoading(false);
      return;
    }
    
    try {
      await verifyOtp(email, finalOtp);
      addToast("OTP verified successfully!", "success");
      // Pass the verified OTP to the next step
      navigate(from, { state: { email, otp: finalOtp, from: 'otp-verified' } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      addToast(errorMessage, 'error');
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendCooldown(30);
    try {
        const purpose = from === '/signup' ? 'sign up' : 'reset your password';
        await sendOtp(email, purpose);
        addToast("A new OTP has been sent.", "info");
    } catch(error) {
        addToast("Failed to resend OTP.", "error");
        setCanResend(true);
    }
  }

  return (
    <AuthLayout
      title="Enter Verification Code"
      subtitle={`We've sent a code to ${email || 'your email'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              ref={(el) => { inputRefs.current[index] = el; }}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500 text-slate-200 transition-all"
            />
          ))}
        </div>

        <div>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.03 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600"
          >
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
            Verify
          </motion.button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Didn't receive the code?{' '}
        <button onClick={handleResendOtp} disabled={!canResend} className="font-medium text-blue-400 hover:text-blue-300 disabled:text-slate-500 disabled:cursor-not-allowed transition">
          Resend {canResend ? '' : `in ${resendCooldown}s`}
        </button>
      </div>
       <p className="mt-8 text-center text-sm text-slate-400">
            <Link to={from === "/signup" ? "/signup" : "/forgot-password"} state={{ email }} className="flex items-center justify-center gap-2 font-medium text-blue-400 hover:text-blue-300">
                <Icon name="arrow-left" className="w-4 h-4" />
                Back to previous step
            </Link>
        </p>
    </AuthLayout>
  );
};

export default OtpVerification;