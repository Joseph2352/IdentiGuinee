import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TricolorBar from '../common/TricolorBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isVerificationPage = location.pathname === '/verify';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isCitizenPage = location.pathname.startsWith('/citizen');
  
  const hideLayout = isAuthPage || isAdminPage || isCitizenPage;
  const hideFooter = hideLayout || isVerificationPage;

  return (
    <div className="bg-background min-h-screen font-body selection:bg-secondary-container">
      {!hideLayout && (
        <>
          <TricolorBar />
          <Navbar />
        </>
      )}
      <main className={!hideLayout ? "min-h-screen" : ""}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
