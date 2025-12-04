'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileEditorProps {
  userId: string;
  initialUsername: string;
}

export const ProfileEditor = ({ userId, initialUsername }: ProfileEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleUpdate = async () => {
    if (username.length < 3) {
      alert('Username must be at least 3 characters long');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId);

    setLoading(false);

    if (error) {
      console.error(error);
      alert('Error updating profile: ' + error.message);
    } else {
      setIsEditing(false);
      router.refresh();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-zinc-100">{username || 'Unknown Traveler'}</h1>
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 text-zinc-500 hover:text-amber-500 transition-colors"
          title="Edit Username"
        >
          <Edit2 size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:border-amber-500 outline-none"
        placeholder="Username"
        minLength={3}
      />
      <button 
        onClick={handleUpdate}
        disabled={loading}
        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
      </button>
      <button 
        onClick={() => {
          setIsEditing(false);
          setUsername(initialUsername);
        }}
        disabled={loading}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded"
      >
        <X size={18} />
      </button>
    </div>
  );
};
