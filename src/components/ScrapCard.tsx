import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import { Scrap } from "../lib/utils";
import { cn } from "../lib/utils";

interface ScrapCardProps {
  scrap: Scrap;
  onClick: (scrap: Scrap) => void;
  key?: any;
}

export function ScrapCard({ scrap, onClick }: ScrapCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => onClick(scrap)}
      className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-md border border-amber-100"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={scrap.imageUrl || `https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&q=80&w=400`}
          alt={scrap.materialType}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md",
            scrap.status === 'Available' ? "bg-emerald-500/80" : "bg-amber-500/80"
          )}>
            {scrap.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium text-amber-900">{scrap.materialType}</h3>
          <span className="text-xs font-medium text-amber-700/60">{scrap.color}</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-800/40">
          <MapPin size={12} />
          <span>{scrap.approxSize}</span>
        </div>
      </div>
    </motion.div>
  );
}
