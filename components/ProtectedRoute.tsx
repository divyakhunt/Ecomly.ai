import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader text="Verifying access..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /signin page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // sign in, which is a nicer user experience than dropping them off on the home page.
    return <Navigate to={`/signin?redirect=${location.pathname}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
