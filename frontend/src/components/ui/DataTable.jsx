import { Search, ChevronLeft, ChevronRight, Inbox, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  pagination, 
  onPageChange, 
  onSearch, 
  searchPlaceholder = "Search records...",
  actions
}) => {
  return (
    <div className="premium-card flex flex-col h-full overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50">
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-500 group-focus-within:text-neon-blue transition-colors" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex shrink-0 gap-3">
          {actions}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-sm text-left">
          <thead className="text-xs tracking-widest uppercase text-slate-400 bg-slate-900/80 sticky top-0 z-10 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`px-6 py-4 font-bold border-b border-border-dark ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <motion.tr 
                    key={`skeleton-${i}`} 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="border-b border-border-dark/50"
                  >
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-5 bg-slate-800/50 rounded animate-pulse w-3/4"></div>
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : data.length === 0 ? (
                <motion.tr 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-transparent"
                >
                  <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Inbox size={48} className="text-slate-700" />
                      <p className="text-base font-mono uppercase tracking-widest">No Operational Data Found</p>
                    </div>
                  </td>
                </motion.tr>
              ) : (
                data.map((row, rowIndex) => (
                  <motion.tr 
                    key={row.id || rowIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                    className="border-b border-border-dark/30 hover:bg-slate-800/40 transition-colors group"
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`px-6 py-4 text-slate-300 group-hover:text-white transition-colors ${col.className || ''}`}>
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total > 0 && (
        <div className="px-6 py-4 border-t border-border-dark flex items-center justify-between bg-slate-900/50">
          <div className="text-sm font-mono text-slate-400">
            Records <span className="text-white font-bold">{pagination.from}</span> to <span className="text-white font-bold">{pagination.to}</span> of <span className="text-neon-blue font-bold">{pagination.total}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white hover:border-neon-blue disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-700 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="p-2 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white hover:border-neon-blue disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-700 disabled:hover:text-slate-400 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
