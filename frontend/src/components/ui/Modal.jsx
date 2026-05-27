import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Tactical Drawer Slide-in from Right */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[600px] bg-slate-950/90 backdrop-blur-3xl border-l border-emerald-500/30 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col"
          >
            {/* Edge Glow Line */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>

            <div className="flex justify-between items-center px-6 py-6 border-b border-slate-800/80 bg-slate-900/50">
              <h3 className="text-xl font-bold text-white tracking-widest uppercase flex items-center gap-3 drop-shadow-md">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl hover:rotate-90 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar text-slate-200">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
