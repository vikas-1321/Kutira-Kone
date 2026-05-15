import { motion } from "motion/react";
import { X, MapPin, Recycle, User, Clock } from "lucide-react";
import { Scrap } from "../lib/utils";
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/auth-hook';
import { useState } from 'react';

interface ScrapDetailsProps {
  scrap: Scrap;
  onClose: () => void;
}

export function ScrapDetails({ scrap, onClose }: ScrapDetailsProps) {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTradeRequest = async () => {
    if (!user || user.uid === scrap.donorId) return;
    
    setRequesting(true);
    setError(null);
    try {
      // 1. Create a trade request document
      await addDoc(collection(db, 'tradeRequests'), {
        scrapId: scrap.id,
        requesterId: user.uid,
        ownerId: scrap.donorId,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      // 2. Simulate status change or notification
      await updateDoc(doc(db, 'scraps', scrap.id), {
        status: 'Swapped', // In a real app, this would happen AFTER acceptance
        updatedAt: serverTimestamp(),
      });
      
      setRequested(true);
    } catch (err: any) {
      console.error("Error creating trade request:", err);
      setError("Request failed. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'tradeRequests');
    } finally {
      setRequesting(false);
    }
  };

  const isOwner = user?.uid === scrap.donorId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-amber-950/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl md:flex"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white">
          <X size={20} />
        </button>

        <div className="md:w-1/2">
          <img
            src={scrap.imageUrl}
            alt={scrap.materialType}
            className="h-full w-full object-cover min-h-[300px]"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="p-8 md:w-1/2 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
                {scrap.materialType}
              </span>
              <span className="text-xs text-amber-800/40">• {scrap.color}</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-amber-900 mb-6">Fabric Sample</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-50 p-2 text-amber-900">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-800/40 font-bold">Approx size</p>
                  <p className="text-sm font-medium text-amber-900">{scrap.approxSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-50 p-2 text-amber-900">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-800/40 font-bold">Shared by</p>
                  <p className="text-sm font-medium text-amber-900">{isOwner ? 'You' : scrap.donorName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-50 p-2 text-amber-900">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-800/40 font-bold">Listed</p>
                  <p className="text-sm font-medium text-amber-900">Recently</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {error && <p className="mb-2 text-center text-[10px] font-bold text-red-500">{error}</p>}
            {requested ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-4 text-emerald-700 font-bold border border-emerald-100">
                <Recycle size={18} />
                <span>Request Sent!</span>
              </div>
            ) : isOwner ? (
              <p className="text-center text-xs text-amber-800/40 italic">This is your listing.</p>
            ) : scrap.status === 'Swapped' ? (
              <button disabled className="w-full rounded-2xl bg-amber-100 py-4 font-bold text-amber-400 cursor-not-allowed">
                Already Swapped
              </button>
            ) : (
              <button
                onClick={handleTradeRequest}
                disabled={requesting || !user}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-800 disabled:opacity-50"
              >
                {requesting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Recycle size={18} />
                    <span>Request Trade</span>
                  </>
                )}
              </button>
            )}
            {!user && !requested && (
              <p className="mt-2 text-center text-[10px] text-amber-800/60 font-medium italic">
                * Sign in to request a trade.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
