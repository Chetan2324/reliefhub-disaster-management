import { motion } from 'framer-motion';

const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden bg-zinc-800/50 rounded-lg ${className}`}>
    <motion.div
      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent"
      animate={{ translateX: ['-100%', '200%'] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
    />
  </div>
);

const DashboardSkeleton = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.3 }}
      className="space-y-5 pb-6 w-full"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-2">
          <Shimmer className="h-8 w-64" />
          <Shimmer className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-8 w-32" />
          <Shimmer className="h-8 w-28" />
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-6 w-6 rounded-md" />
            </div>
            <Shimmer className="h-8 w-16 mt-4" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Tactical Map Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[340px]">
            <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-20" />
            </div>
            <Shimmer className="flex-1 rounded-none bg-zinc-900/80" />
          </div>

          {/* Analytics Chart Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[260px]">
            <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <Shimmer className="h-4 w-40" />
              <Shimmer className="h-5 w-24 rounded" />
            </div>
            <Shimmer className="flex-1 rounded-none m-4 bg-zinc-900/80" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Alerts Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-5 w-8 rounded-full" />
            </div>
            <div className="p-1.5 space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-2.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex gap-2.5">
                  <Shimmer className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <Shimmer className="h-3 w-3/4" />
                    <Shimmer className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Skeleton */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-[320px]">
            <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
              <Shimmer className="h-4 w-36" />
            </div>
            <div className="flex-1 p-4 space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Shimmer className="w-6 h-6 rounded-full flex-shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <Shimmer className="h-3 w-5/6" />
                    <Shimmer className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSkeleton;
