import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileEditor } from '../../components/ProfileEditor';
import { Coins, Calendar, Clock, Trophy, Sword, Scroll } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch Saves
  const { data: saves } = await supabase
    .from('saves')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 mb-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-zinc-700 shadow-lg overflow-hidden relative">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl">🧙‍♂️</span>
               )}
            </div>
            <div>
              <div className="text-sm text-zinc-400 uppercase tracking-wider font-bold mb-1">Adventurer Profile</div>
              <ProfileEditor userId={user.id} initialUsername={profile?.username || ''} />
              <div className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                <Calendar size={14} />
                Joined {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 shadow-inner">
            <div className="text-right">
              <div className="text-xs text-zinc-500 uppercase font-bold">Credits</div>
              <div className="text-2xl font-bold text-amber-500">{profile?.credits || 0}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-900/20 flex items-center justify-center border border-amber-500/30">
                <Coins className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center gap-4">
           <div className="w-12 h-12 rounded-lg bg-emerald-900/20 flex items-center justify-center border border-emerald-500/30 text-emerald-500">
             <Trophy size={24} />
           </div>
           <div>
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Total Runs</div>
             <div className="text-2xl font-bold text-zinc-100">{profile?.total_runs || 0}</div>
           </div>
        </div>
        {/* Placeholder for future stats */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 opacity-50">
           <div className="w-12 h-12 rounded-lg bg-blue-900/20 flex items-center justify-center border border-blue-500/30 text-blue-500">
             <Sword size={24} />
           </div>
           <div>
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Monsters Slain</div>
             <div className="text-2xl font-bold text-zinc-100">--</div>
           </div>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center gap-4 opacity-50">
           <div className="w-12 h-12 rounded-lg bg-purple-900/20 flex items-center justify-center border border-purple-500/30 text-purple-500">
             <Scroll size={24} />
           </div>
           <div>
             <div className="text-zinc-500 text-xs uppercase font-bold mb-1">Quests Completed</div>
             <div className="text-2xl font-bold text-zinc-100">--</div>
           </div>
        </div>
      </div>

      {/* Recent Saves */}
      <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-3 cinzel border-b border-zinc-800 pb-4">
        <Scroll className="text-emerald-500" />
        Recent Chronicles
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {saves && saves.length > 0 ? (
          saves.map((save: any) => (
            <div key={save.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg hover:border-zinc-600 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sword size={64} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div>
                    <h3 className="font-bold text-lg text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {save.character_name || 'Unnamed Hero'}
                    </h3>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300">{save.genre}</span>
                        <span>Level {save.level}</span>
                    </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-zinc-400 mt-4 pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>Last played: {new Date(save.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg text-zinc-500">
            <p>No chronicles found. Start a new adventure!</p>
            <Link href="/" className="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors">
              Begin Journey
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
