import { motion } from 'framer-motion';

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed inset-0 z-[100] flex items-center justify-center"
    style={{ background: '#ffffff' }}
  >
    <div className="flex flex-col items-center gap-5">
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl font-display text-2xl font-black text-white"
        style={{ background: 'linear-gradient(135deg,#F77F00,#0B2545)' }}
      >
        S
      </motion.div>
      <span className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: '#9ca3af' }}>
        SSC Pathnirman
      </span>
      <div className="h-[2px] w-40 overflow-hidden rounded-full" style={{ background: '#e5e7eb' }}>
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="h-full w-full"
          style={{ background: 'linear-gradient(90deg,#F77F00,#fbbf24)' }}
        />
      </div>
    </div>
  </motion.div>
);

export default LoadingScreen;
