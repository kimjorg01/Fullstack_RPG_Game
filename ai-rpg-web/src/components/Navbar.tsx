'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Menu, X, User, LogIn, Trophy, Home, Coins, ChevronDown, LogOut } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

export const Navbar = () => {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 z-50 flex items-center justify-between px-4 md:px-8">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center transform rotate-45">
            <div className="w-4 h-4 bg-zinc-900 transform -rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-wider text-zinc-100 cinzel hidden md:block">
            Infinite Adventure
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
          <Home size={16} /> Home
        </Link>
        <Link href="/leaderboard" className="text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
          <Trophy size={16} /> Leaderboard
        </Link>
        <Link href="/about" className="text-zinc-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-sm font-medium uppercase tracking-wide">
          <User size={16} /> About
        </Link>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
        ) : user ? (
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-zinc-900 p-2 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
            >
              <div className="text-right hidden md:block">
                <div className="text-xs text-zinc-400">Welcome back</div>
                <div className="text-sm font-bold text-zinc-200 max-w-[100px] truncate">
                  {user.email?.split('@')[0]}
                </div>
              </div>
              <div className="w-8 h-8 bg-emerald-900/50 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-500">
                <User size={16} />
              </div>
              <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-zinc-800 mb-2">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">Credits</div>
                  <div className="flex items-center gap-2 text-amber-500 font-bold">
                    <Coins size={16} />
                    <span>1,250</span>
                  </div>
                </div>
                
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                  <User size={16} /> My Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-md font-bold text-sm transition-colors"
          >
            <LogIn size={16} />
            <span className="hidden md:inline">Login / Register</span>
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-zinc-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-zinc-800 p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link href="/" className="flex items-center gap-3 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg">
            <Home size={20} /> Home
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-3 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg">
            <Trophy size={20} /> Leaderboard
          </Link>
          <Link href="/about" className="flex items-center gap-3 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg">
            <User size={20} /> About
          </Link>
        </div>
      )}
    </nav>
  );
};
