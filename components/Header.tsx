import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/chatbot', label: 'Chatbot', icon: 'chat' },
  { to: '/image-generator', label: 'Image Gen', icon: 'image' },
  { to: '/background-remover', label: 'BG Remover', icon: 'background' },
  { to: '/make-my-brand', label: 'Brand Maker', icon: 'tag' },
  { to: '/product-summary', label: 'Product Lister', icon: 'summary' },    
  { to: '/label-cropper', label: 'Label Cropper', icon: 'crop' },
];

const authMenuVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    }
  }
};

const authMenuItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 500, damping: 30 }
  }
};

const AuthSection: React.FC<{ onLinkClick: () => void }> = ({ onLinkClick }) => {
    const { isAuthenticated, user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        onLinkClick();
        navigate('/');
    };

    const linkClasses = "w-full text-left flex items-center gap-3.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-blue-300 rounded-md transition-all duration-200";

    return (
        <motion.div variants={authMenuVariants} initial="hidden" animate="visible" exit="hidden">
            {isAuthenticated && user ? (
                <>
                    <motion.div variants={authMenuItemVariants} className="px-4 pt-3 pb-2 border-b border-slate-700/60">
                        <p className="font-semibold text-slate-100 truncate">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    </motion.div>
                    <div className="p-1.5">
                      <motion.button onClick={handleSignOut} className={linkClasses} variants={authMenuItemVariants}>
                         <Icon name="logout" className="w-5 h-5 text-red-400"/>
                         Sign Out
                      </motion.button>
                    </div>
                </>
            ) : (
                <div className="p-1.5 space-y-1">
                    <motion.div variants={authMenuItemVariants}>
                        <Link to="/signin" onClick={onLinkClick} className={linkClasses}>
                            <Icon name="login" className="w-5 h-5 text-green-400"/>
                            Sign In
                        </Link>
                    </motion.div>
                    <motion.div variants={authMenuItemVariants}>
                        <Link to="/signup" onClick={onLinkClick} className={linkClasses}>
                            <Icon name="user-plus" className="w-5 h-5 text-blue-400"/>
                            Sign Up
                        </Link>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};


const Header: React.FC = () => {
  const { isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const headerVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };
  
  const navVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
  };

  const navItemVariants: Variants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="bg-slate-950/70 backdrop-blur-lg sticky top-0 z-40 w-full border-b border-slate-800/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center space-x-2.5 group">
                <Icon name="logo" className="h-8 w-8 text-blue-500 transition-transform duration-500 group-hover:rotate-12" />
                <span className="text-xl font-bold text-gray-100 tracking-tight transition-colors group-hover:text-blue-300">Ecomly.ai</span>
              </NavLink>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop Navigation */}
              <motion.nav 
                variants={navVariants}
                initial="hidden"
                animate="visible"
                className="hidden md:flex md:space-x-1"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.to} variants={navItemVariants} whileHover={{ y: -2 }}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 group ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <motion.div 
                            className="absolute inset-0 rounded-md transition-colors duration-300"
                            animate={{ backgroundColor: isActive ? 'rgba(30, 41, 59, 0.6)' : 'rgba(30, 41, 59, 0)' }}
                          ></motion.div>
                          <div className="absolute inset-0 rounded-md bg-slate-800/0 group-hover:bg-slate-800/40 transition-colors duration-300"></div>
                          
                          <Icon name={link.icon as any} className="relative h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" />
                          <span className="relative">{link.label}</span>
                          {isActive && (
                            <motion.span
                              layoutId="active-nav-underline"
                              className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                              style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)' }}
                              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>

              {/* Profile Menu (for both desktop and mobile) */}
              <div className="hidden md:block h-8 w-px bg-slate-700/50 ml-3"></div>
              
              <div className="relative" ref={menuRef}>
                <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                      <motion.div key="loader" className="w-9 h-9 shimmer-loader rounded-full" />
                  ) : (
                      <motion.div key="auth-button" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                          <motion.button 
                              onClick={() => setMenuOpen(!menuOpen)} 
                              className="flex items-center justify-center h-9 w-9 bg-slate-800 rounded-full border border-slate-700 hover:border-blue-500 transition-colors"
                              animate={{ scale: menuOpen ? 1.1 : 1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                          >
                            <Icon name="user" className="h-5 w-5 text-slate-300"/>
                          </motion.button>
                      </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {menuOpen && !isLoading && (
                    <motion.div
                      layout   // ✅ add this
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className="absolute right-0 mt-3 w-60 min-h-[100px] origin-top-right bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-blue-500/10 z-50 overflow-hidden"
                    >
                      <AuthSection onLinkClick={() => setMenuOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Mobile Hamburger Button */}
              <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 inline-flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                  <span className="sr-only">Open menu</span>
                  <Icon name="hamburger" className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-slate-950 p-6 z-50 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2.5 group">
                   <Icon name="logo" className="h-7 w-7 text-blue-500" />
                   <span className="text-lg font-bold text-gray-100">Ecomly.ai</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                  <Icon name="close" className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-grow mt-6">
                <ul className="space-y-2">
                  {navLinks.map(link => (
                    <li key={link.to}>
                      <NavLink 
                        to={link.to} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({isActive}) => `flex items-center gap-4 p-3 rounded-lg transition-colors text-base font-medium ${isActive ? 'bg-blue-500/10 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}
                      >
                         <Icon name={link.icon as any} className="w-6 h-6"/>
                         {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;