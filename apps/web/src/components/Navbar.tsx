import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { Activity, User, LogOut, CheckCircle2, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onToggleTracePanel?: () => void;
  isTraceOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleTracePanel, isTraceOpen }) => {
  const { user, logout } = useAuth();
  const { entitlements } = useJourney();
  const navigate = useNavigate();
  const location = useLocation();

  const isPriorityUnlocked = entitlements.includes('PRIORITY_APS_CONSULTANT_REVIEW');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 relative isolate w-full bg-educaro-main/90 backdrop-blur-md border-b border-educaro-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-educaro-accent flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-educaro-accentHover transition-colors">
            ER
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg tracking-tight text-educaro-primary">
                EduRoute AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-educaro-icon text-educaro-muted font-medium border border-educaro-border">
                Educaro 🇩🇪🇮🇳
              </span>
            </div>
            <p className="text-[11px] text-educaro-muted hidden sm:block">Agentic Applicant Journey to Germany</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-4 min-w-0 overflow-x-hidden text-sm font-medium text-educaro-muted">
          <Link
            to="/"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Home
          </Link>
          <a
            href="/#how-it-works"
            className="transition-colors hover:text-educaro-primary"
          >
            How It Works
          </a>
          <Link
            to="/journey/documents"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/journey/documents' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Documents
          </Link>
          <Link
            to="/journey/qualification"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/journey/qualification' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Qualification
          </Link>
          <Link
            to="/journey/recommendations"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/journey/recommendations' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Recommendation
          </Link>
          <Link
            to="/candidate-details"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/candidate-details' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Candidate Details
          </Link>
          <Link
            to="/journey/cv"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/journey/cv' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            CV Generation
          </Link>
          <Link
            to="/journey/next-steps"
            className={`transition-colors hover:text-educaro-primary ${location.pathname === '/journey/next-steps' ? 'text-educaro-primary font-semibold' : ''}`}
          >
            Premium
          </Link>
        </nav>

        {/* Right Auth Entry Points (PRD Section 9.1 & Section 8.2) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          

          

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/candidate-details"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-educaro-main hover:bg-educaro-icon border border-educaro-border text-xs text-educaro-primary transition-colors"
              >
                <User className="w-3.5 h-3.5 text-educaro-accent" />
                <span className="max-w-[120px] truncate font-medium">{user.email}</span>
                {isPriorityUnlocked && <ShieldCheck className="w-3.5 h-3.5 text-educaro-accent ml-1" />}
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-educaro-muted hover:text-educaro-primary hover:bg-educaro-main transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth?mode=login"
              className="text-sm font-medium text-educaro-primary hover:text-educaro-accent px-3 py-1.5 rounded-full hover:bg-educaro-main transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
