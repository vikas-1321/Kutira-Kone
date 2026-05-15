import { motion } from "motion/react";

const IDEAS = [
  {
    title: "Patchwork Pouch",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400",
    description: "Combine 4x4 squares of silk to make a reusable jewelry bag."
  },
  {
    title: "Upcycled Face Mask",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    description: "Double-layered cotton scraps for breathable summer masks."
  },
  {
    title: "Eco Handkerchief",
    image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=400",
    description: "Soft linen or cotton scraps with simple running stitch edges."
  },
  {
    title: "Fabric Coasters",
    image: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&q=80&w=400",
    description: "Quilted synthetic scraps for heat-resistant tea coasters."
  }
];

export function DesignIdeas() {
  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-amber-900">Upcycling Projects</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {IDEAS.map((idea, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="min-w-[240px] flex-shrink-0 overflow-hidden rounded-3xl bg-white shadow-sm border border-amber-100"
          >
            <div className="aspect-video overflow-hidden">
              <img src={idea.image} alt={idea.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg font-bold text-amber-900">{idea.title}</h3>
              <p className="mt-1 text-xs text-amber-800/60 leading-relaxed">{idea.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
