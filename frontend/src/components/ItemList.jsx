import { LoadingSpinner } from './LoadingSpinner';
import { motion } from 'framer-motion';

/**
 * ItemList Component
 * A reusable list component that handles loading, error, and empty states.
 */
export const ItemList = ({ items, renderItem, loading, emptyMessage = "Tidak ada data ditemukan." }) => {
  if (loading) {
    return (
      <div className="py-20 flex justify-center" data-testid="loading-state">
        <LoadingSpinner />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-20 text-center"
        data-testid="empty-state"
      >
        <p className="text-slate-500 dark:text-slate-400 font-medium">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="item-grid">
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

export default ItemList;