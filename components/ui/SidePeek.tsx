"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

type SidePeekProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullPage: () => void;
  children: React.ReactNode;
};

export function SidePeek({
  isOpen,
  onClose,
  onOpenFullPage,
  children,
}: SidePeekProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/20 dark:bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[61] h-screen w-full md:w-[55vw] lg:w-[50vw] xl:w-[45vw] bg-white dark:bg-[#191919] shadow-2xl border-l border-zinc-200 dark:border-zinc-800"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 sm:px-4 py-3 sm:py-2 gap-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button
                onClick={onClose}
                className="pointer-events-auto p-2.5 sm:p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors touch-manipulation min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={onOpenFullPage}
                className="pointer-events-auto flex items-center gap-2 px-3 py-2.5 sm:py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium touch-manipulation"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">Open as page</span><span className="sm:hidden">Open</span>
              </button>
            </div>
            <div className="h-full overflow-y-auto overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    ,
    document.body
  );
}
