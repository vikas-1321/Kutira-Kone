import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Check, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Scrap, MATERIAL_TYPES, MaterialType, cn } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../lib/auth-hook';
import { useGeolocation } from '../lib/location-hook';
import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface ScrapFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ScrapForm({ onClose, onSuccess }: ScrapFormProps) {
  const { user } = useAuth();
  const location = useGeolocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [materialType, setMaterialType] = useState<MaterialType>("Cotton");
  const [approxSize, setApproxSize] = useState("");
  const [color, setColor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError("Cloudinary not configured. Check your environment variables.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Local Compression (Makes the mobile experience much faster)
      const options = {
        maxSizeMB: 1, // Compress to ~1MB
        maxWidthOrHeight: 1280, // High quality but mobile friendly
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'kutira_kone_scraps'); // Organizes files

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await response.json();
      setImageUrl(data.secure_url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("Failed to upload image. Please check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || !location || !imageUrl) return;

    setIsPosting(true);
    setError(null);
    try {
      await addDoc(collection(db, 'scraps'), {
        imageUrl,
        materialType,
        approxSize,
        color,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        donorId: user.uid,
        donorName: user.displayName || 'Neighbor Tailor',
        status: 'Available',
        createdAt: serverTimestamp(),
      });
      onSuccess();
    } catch (err: any) {
      console.error("Error adding scrap:", err);
      setError("Failed to post scrap. Please check your connection.");
      handleFirestoreError(err, OperationType.WRITE, 'scraps');
    } finally {
      setIsPosting(false);
    }
  };

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
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-8 scrollbar-hide">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-amber-900">List your Scrap</h2>
            <button onClick={onClose} className="rounded-full p-2 hover:bg-amber-50 text-amber-900/40">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800/60">Fabric Photo</label>
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={cn(
                  "relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all",
                  imageUrl ? "border-emerald-500/50 bg-emerald-50/10" : "border-amber-200 bg-amber-50/50 hover:border-amber-300",
                  isUploading && "animate-pulse border-amber-400"
                )}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-md">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                  </>
                ) : isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-900" />
                    <span className="text-xs font-medium text-amber-900">Uploading photo...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-8 text-center text-amber-800/40">
                    <div className="rounded-full bg-amber-100 p-4 text-amber-900">
                      <Camera size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">Tap to snap or upload</p>
                      <p className="mt-1 text-[10px]">Show us the beautiful fabric patterns!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-800/60">Material</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                  className="w-full rounded-2xl border-none bg-amber-50 py-3 px-4 text-sm text-amber-900 focus:ring-2 focus:ring-amber-200"
                >
                  {MATERIAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-amber-800/60">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Indigo Blue"
                  className="w-full rounded-2xl border-none bg-amber-50 py-3 px-4 text-sm text-amber-900 focus:ring-2 focus:ring-amber-200"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-800/60">Approx Size</label>
              <input
                type="text"
                placeholder="e.g. 2 x 2 feet"
                className="w-full rounded-2xl border-none bg-amber-50 py-3 px-4 text-sm text-amber-900 focus:ring-2 focus:ring-amber-200"
                value={approxSize}
                onChange={(e) => setApproxSize(e.target.value)}
                required
              />
            </div>

            <div className="pt-4">
              {error && <p className="mb-4 text-center text-xs font-bold text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isPosting || isUploading || !imageUrl || !location}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-900 py-4 font-bold text-white shadow-lg transition-all hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPosting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Post Scrap</span>
                  </>
                )}
              </button>
              {!location && (
                <p className="mt-2 text-center text-[10px] text-amber-800/60 italic">
                  * Enable location to detect your 5km radius.
                </p>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
