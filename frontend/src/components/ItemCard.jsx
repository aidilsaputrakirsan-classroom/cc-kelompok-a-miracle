import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

/**
 * ItemCard Component
 * A reusable, polished card component for displaying items with details.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Lucide icon component
 * @param {string} props.title - Main title of the card
 * @param {string} props.subtitle - Secondary text or category
 * @param {string} props.description - Detailed text
 * @param {string} props.badge - Optional status badge text
 * @param {string} props.badgeColor - Tailwind color class for badge (e.g., 'bg-green-500')
 * @param {Function} props.onClick - Optional click handler
 */
export const ItemCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  description, 
  badge,
  badgeColor = 'bg-[#660000]',
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[#660000]/10 transition-all cursor-pointer overflow-hidden`}
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#660000]/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 bg-[#660000]/10 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-[#660000] dark:text-red-400 group-hover:scale-110 group-hover:bg-[#660000]/20 transition-all duration-500 shadow-inner">
            {Icon && <Icon className="w-7 h-7" />}
          </div>
          
          {badge && (
            <span className={`px-4 py-1.5 ${badgeColor} text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
              {badge}
            </span>
          )}
        </div>

        <div className="mb-4">
          {subtitle && (
            <span className="text-[#660000] dark:text-red-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">
              {subtitle}
            </span>
          )}
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#660000] dark:group-hover:text-red-400 transition-colors">
            {title}
          </h3>
        </div>

        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center text-[#660000] dark:text-red-400 text-xs font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
          Lihat Detail
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
};

export default ItemCard;