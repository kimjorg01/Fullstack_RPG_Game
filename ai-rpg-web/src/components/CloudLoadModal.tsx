import React, { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { X, Trash2, Download, Loader2, Cloud, Calendar, User } from 'lucide-react';
import { SaveData } from '../types';
import { useAuth } from './AuthProvider';

interface CloudLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (saveData: SaveData) => void;
}

interface SaveFile {
  id: string;
  character_name: string;
  genre: string;
  level: number;
  updated_at: string;
  game_state: SaveData;
}

export const CloudLoadModal: React.FC<CloudLoadModalProps> = ({ isOpen, onClose, onLoad }) => {
  const [saves, setSaves] = useState<SaveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && user) {
      fetchSaves();
    }
  }, [isOpen, user]);

  const fetchSaves = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('saves')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching saves:', error);
    } else {
      setSaves(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this save?')) return;

    setDeletingId(id);
    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting save:', error);
      alert('Failed to delete save.');
    } else {
      setSaves(prev => prev.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 cinzel flex items-center gap-2 text-amber-500 border-b border-zinc-800 pb-4">
          <Cloud size={24} />
          Cloud Saves
        </h2>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-3">
              <Loader2 className="animate-spin" size={32} />
              <p>Fetching your legends...</p>
            </div>
          ) : saves.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <p>No cloud saves found.</p>
            </div>
          ) : (
            saves.map((save) => (
              <div 
                key={save.id}
                className="group flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800 hover:border-amber-900/50 rounded-lg transition-all hover:bg-zinc-900 cursor-pointer"
                onClick={() => onLoad(save.game_state)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-amber-700/50">
                    <User size={20} className="text-zinc-500 group-hover:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-200 group-hover:text-amber-400 transition-colors">
                      {save.character_name || 'Unknown Hero'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                      <span className="bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {save.genre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(save.updated_at).toLocaleDateString()} {new Date(save.updated_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(save.id, e)}
                    disabled={deletingId === save.id}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-colors"
                    title="Delete Save"
                  >
                    {deletingId === save.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                  </button>
                  <button
                    className="p-2 text-zinc-400 group-hover:text-emerald-400 hover:bg-emerald-950/30 rounded transition-colors"
                    title="Load Save"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
