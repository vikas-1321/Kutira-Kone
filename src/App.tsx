import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Recycle, Map as MapIcon, Grid, Leaf, User } from 'lucide-react';
import { ScrapGrid } from './components/ScrapGrid';
import { ScrapForm } from './components/ScrapForm';
import { ScrapDetails } from './components/ScrapDetails';
import { ScrapMap } from './components/ScrapMap';
import { DesignIdeas } from './components/DesignIdeas';
import { useAuth } from './lib/auth-hook';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Scrap } from './lib/utils';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedScrap, setSelectedScrap] = useState<Scrap | null>(null);
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans text-amber-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-amber-900 p-2 text-white">
              <Recycle size={24} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-amber-950">Kutira-Kone</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-800/40">Zero-Waste Exchange</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-xs font-bold text-amber-900">{user.displayName}</p>
                  <button onClick={handleSignOut} className="text-[10px] font-bold text-amber-800/40 hover:text-amber-900">Sign Out</button>
                </div>
                <img src={user.photoURL || ''} alt="" className="h-10 w-10 rounded-full border-2 border-amber-100" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100 transition-colors"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-amber-900 p-8 md:p-16 text-white shadow-2xl shadow-amber-900/20">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 backdrop-blur-md w-fit">
              <Leaf size={14} className="text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sustainability First</span>
            </div>
            <h2 className="font-serif text-4xl font-bold leading-tight md:text-6xl">
              Trade your fabric leftovers <span className="text-amber-400 italic">locally.</span>
            </h2>
            <p className="text-lg text-amber-100/80 font-medium max-w-md">
              A community space for rural tailors to swap fabric scraps and reduce waste.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => user ? setShowForm(true) : handleSignIn()}
                className="flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-amber-900 shadow-xl transition-transform hover:scale-105 active:scale-95"
              >
                <Plus size={20} />
                <span>Post a Scrap</span>
              </button>
              <button
                onClick={() => setView(view === 'grid' ? 'map' : 'grid')}
                className="flex items-center gap-2 rounded-2xl bg-amber-800/40 px-8 py-4 font-bold text-white backdrop-blur-md border border-amber-700/50 hover:bg-amber-800/60 transition-colors"
              >
                {view === 'grid' ? <MapIcon size={20} /> : <Grid size={20} />}
                <span>{view === 'grid' ? 'Show Map' : 'Show Grid'}</span>
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none">
             <img 
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800" 
              className="h-full w-full object-cover grayscale"
              alt=""
              referrerPolicy="no-referrer"
             />
          </div>
        </div>

        {/* Dynamic View */}
        <AnimatePresence mode="wait">
          {view === 'grid' ? (
            <motion.section
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl font-bold text-amber-900">Available Scraps</h2>
                <div className="text-xs font-bold text-amber-800/40 uppercase tracking-widest">5km Radius Enabled</div>
              </div>
              <ScrapGrid onSelectScrap={(scrap) => setSelectedScrap(scrap)} />
            </motion.section>
          ) : (
            <motion.section
              key="map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-3xl font-bold text-amber-900">Map Connections</h2>
                <div className="text-xs font-bold text-amber-800/40 uppercase tracking-widest">Showing Your Neighborhood</div>
              </div>
              <ScrapMap />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Upcycling Section */}
        <DesignIdeas />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-amber-100 bg-amber-50 py-12">
        <div className="mx-auto max-w-7xl px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-amber-900 opacity-50">
            <Recycle size={20} />
            <span className="font-serif font-bold uppercase tracking-widest">Kutira-Kone</span>
          </div>
          <p className="text-xs text-amber-800/40 font-medium">Built with ❤️ for rural artisan communities.</p>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <ScrapForm
            onClose={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        )}
        {selectedScrap && (
          <ScrapDetails
            scrap={selectedScrap}
            onClose={() => setSelectedScrap(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
