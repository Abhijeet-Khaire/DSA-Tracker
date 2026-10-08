import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../animations/variants';
import { isReducedMotionPreferred } from '../../animations/motionConfig';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const prefersReduced = isReducedMotionPreferred();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const modalPortal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={onClose}
          variants={prefersReduced ? undefined : modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className={`relative w-full ${maxWidth} glass-panel bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto`}
            onClick={(e) => e.stopPropagation()}
            variants={prefersReduced ? undefined : modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/80">
              <h3 className="text-base font-extrabold text-slate-100 tracking-wide font-sans">{title}</h3>
              <motion.button
                onClick={onClose}
                whileHover={prefersReduced ? undefined : { scale: 1.12, rotate: 90 }}
                whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalPortal, document.body);
}
