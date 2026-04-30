import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "Accueil" },
    { to: "/verify", label: "Vérifier un document" },
    { to: "/about", label: "À propos" },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const activeClass = "text-[#0d631b] font-bold border-b-2 border-[#0d631b] pb-1 transition-all duration-200";
  const inactiveClass = "text-stone-500 font-medium hover:text-[#0d631b] transition-all duration-200";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-stone-100">
        {/* Guinea flag stripe - Full width */}
        <div className="h-[4px] w-full flex">
          <div className="flex-1 bg-[#CE1126]" />
          <div className="flex-1 bg-[#FCD116]" />
          <div className="flex-1 bg-[#009A44]" />
        </div>

        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-2">
          {/* Brand - Text based as in image */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="IdentiGuinée"
              className="h-16 w-auto transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Desktop nav links - Centered disposition */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="hidden md:inline-flex items-center bg-[#0d631b] text-white text-sm font-bold px-7 py-3 rounded-lg hover:bg-[#0a4f15] transition-all duration-150 shadow-md shadow-[#0d631b]/10"
              >
                Connexion Citoyen
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/dashboard'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200/50 transition-colors text-stone-700 font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Mon Espace
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Déconnexion"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#0d631b] hover:bg-[#0d631b]/5 transition-colors"
              aria-label="Toggle Menu"
            >
              <span className="material-symbols-outlined text-3xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 bg-white md:hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) => `text-2xl ${isActive ? 'text-[#0d631b] font-bold border-b-4 border-[#0d631b] pb-2' : 'text-stone-500 font-medium'}`}
            >
              {link.label}
            </NavLink>
          ))}
          
          {!isAuthenticated ? (
            <Link 
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-4 bg-[#0d631b] text-white px-10 py-4 rounded-xl font-bold text-xl shadow-lg"
            >
              Connexion Citoyen
            </Link>
          ) : (
            <>
              <Link 
                to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/citizen/dashboard'}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-2xl text-[#0d631b] font-bold"
              >
                <span className="material-symbols-outlined text-3xl">grid_view</span>
                Tableau de bord
              </Link>
              <button 
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 text-2xl text-red-600 font-bold"
              >
                <span className="material-symbols-outlined text-3xl">logout</span>
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;