import React, { useEffect, useState } from 'react';
import { Dice5, Upload, Shield, LogOut, User } from 'lucide-react'; // Added icons
import { createClient } from '@/utils/supabase/client'; // Import Supabase
import { User as SupabaseUser } from '@supabase/supabase-js';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (file: File) => void;
  onCloudLoad: (gameState: any) => void; // New prop for loading from cloud
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame, onCloudLoad }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saves, setSaves] = useState<any[]>([]);
  const [showSaves, setShowSaves] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchSaves();
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchSaves();
      else setSaves([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    // Simple Google Login
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowSaves(false);
  };

  const fetchSaves = async () => {
    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (data) setSaves(data);
  };

  const loadCloudSave = (saveData: any) => {
    onCloudLoad(saveData.game_state);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 text-zinc-100 font-serif relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black -z-10" />

      <h1 className="text-6xl md:text-8xl mb-12 text-center cinzel font-bold text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-600 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        Infinite<br />Adventure
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-md px-4 relative z-10">
        <button
          onClick={onNewGame}
          className="group relative px-8 py-4 bg-zinc-900/50 border border-zinc-700 hover:border-zinc-400 transition-all duration-300 rounded-sm overflow-hidden"
        >
          <div className="absolute inset-0 bg-zinc-100/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="flex items-center justify-center gap-3 relative z-10">
            <Dice5 className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
            <span className="cinzel text-xl tracking-wider text-zinc-300 group-hover:text-white">New Game</span>
          </div>
        </button>

        {/* Auth Section */}
        {!user ? (
          <button
            onClick={handleLogin}
            className="group relative px-8 py-4 bg-blue-900/20 border border-blue-900/50 hover:border-blue-500/50 transition-all duration-300 rounded-sm"
          >
            <div className="flex items-center justify-center gap-3">
              <User className="w-5 h-5 text-blue-400" />
              <span className="cinzel text-xl tracking-wider text-blue-200">Login with Google</span>
            </div>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowSaves(!showSaves)}
              className="px-8 py-4 bg-emerald-900/20 border border-emerald-900/50 hover:border-emerald-500/50 transition-all duration-300 rounded-sm flex items-center justify-center gap-3"
            >
               <Shield className="w-5 h-5 text-emerald-400" />
               <span className="cinzel text-xl tracking-wider text-emerald-200">Load Cloud Save ({saves.length})</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        )}

        {/* Cloud Saves List */}
        {showSaves && user && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-2 max-h-60 overflow-y-auto mt-2">
             {saves.length === 0 && <p className="text-center text-zinc-500 py-4">No saves found.</p>}
             {saves.map((save) => (
               <div key={save.id} onClick={() => loadCloudSave(save)} className="p-3 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 last:border-0">
                  <div className="font-bold text-zinc-200">{save.character_name || "Unknown Hero"}</div>
                  <div className="text-xs text-zinc-500 flex justify-between">
                    <span>{save.genre} - Lvl {save.level}</span>
                    <span>{new Date(save.updated_at).toLocaleDateString()}</span>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* Legacy Local Upload */}
        <div className="relative group">
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLoadGame(file);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div className="px-8 py-4 bg-zinc-900/30 border border-zinc-800 group-hover:border-zinc-600 transition-all duration-300 rounded-sm flex items-center justify-center gap-3">
            <Upload className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400" />
            <span className="cinzel text-xl tracking-wider text-zinc-500 group-hover:text-zinc-300">Upload File</span>
          </div>
        </div>
      </div>
    </div>
  );
};