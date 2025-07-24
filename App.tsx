import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import ProductSummary from './pages/ProductSummary';
import ImageGenerator from './pages/ImageGenerator';
import BackgroundRemover from './pages/BackgroundRemover';
import LabelCropper from './pages/LabelCropper';
import MakeMyBrand from './pages/MakeMyBrand';
import ScrollToTop from './components/ScrollToTop';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerification from './pages/OtpVerification';
import ProtectedRoute from './components/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -30 },
};

const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.6,
};

const App: React.FC = () => {
  const location = useLocation();

  const wrapInProtectedRoute = (element: JSX.Element) => <ProtectedRoute>{element}</ProtectedRoute>;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <ScrollToTop />
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-4"
        >
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verify" element={<OtpVerification />} />

            {/* Protected Routes */}
            <Route path="/chatbot" element={wrapInProtectedRoute(<Chatbot />)} />
            <Route path="/product-summary" element={wrapInProtectedRoute(<ProductSummary />)} />
            <Route path="/image-generator" element={wrapInProtectedRoute(<ImageGenerator />)} />
            <Route path="/make-my-brand" element={wrapInProtectedRoute(<MakeMyBrand />)} />
            <Route path="/background-remover" element={wrapInProtectedRoute(<BackgroundRemover />)} />
            <Route path="/label-cropper" element={wrapInProtectedRoute(<LabelCropper />)} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default App;
