import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Scrap, MATERIAL_TYPES, MaterialType, cn } from '../lib/utils';
import { ScrapCard } from './ScrapCard';
import { Search } from 'lucide-react';

interface ScrapGridProps {
  onSelectScrap: (scrap: Scrap) => void;
}

export function ScrapGrid({ onSelectScrap }: ScrapGridProps) {
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MaterialType | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Using a simpler query first to check if indexing is the issue
    let q = query(collection(db, 'scraps'));

    if (filter !== 'All') {
      q = query(collection(db, 'scraps'), where('materialType', '==', filter));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scrap));
      // Sort in memory for now to avoid index requirements in MVP
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setScraps(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      setError("Failed to load scraps. Please try again.");
      handleFirestoreError(err, OperationType.LIST, 'scraps');
    });

    return unsubscribe;
  }, [filter]);

  const filteredScraps = scraps.filter(s => 
    s.materialType.toLowerCase().includes(search.toLowerCase()) ||
    s.color.toLowerCase().includes(search.toLowerCase()) ||
    s.donorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/40" size={18} />
          <input
            type="text"
            placeholder="Search by material, color..."
            className="w-full rounded-2xl border-none bg-amber-50 py-3 pl-10 pr-4 text-sm text-amber-900 placeholder:text-amber-800/30 focus:ring-2 focus:ring-amber-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('All')}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
              filter === 'All' ? "bg-amber-900 text-white" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            )}
          >
            All
          </button>
          {MATERIAL_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors",
                filter === type ? "bg-amber-900 text-white" : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-900 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex h-64 flex-col items-center justify-center text-amber-800/60">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 text-xs font-bold underline"
          >
            Reload Page
          </button>
        </div>
      ) : filteredScraps.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-amber-800/40">
          <p>No scraps found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredScraps.map(scrap => (
            <ScrapCard key={scrap.id} scrap={scrap} onClick={onSelectScrap} />
          ))}
        </div>
      )}
    </div>
  );
}
