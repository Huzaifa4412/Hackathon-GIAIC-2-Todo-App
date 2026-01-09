'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export function PageReveal({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Initial load animation
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    // Reveal animation
    const revealTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => {
      clearTimeout(loadTimer)
      clearTimeout(revealTimer)
    }
  }, [])

  return (
    <>
      {/* Loading screen overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-[#050505] z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
            }}
          >
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* Animated logo/spinner */}
              <motion.div
                className="relative w-16 h-16"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 border-4 border-[#222222] rounded-full" />
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-[#ff4d00] rounded-full"
                  animate={{
                    rotate: -360,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>

              {/* Loading text with pulse */}
              <motion.p
                className="text-sm font-medium text-[#a0a0a0]"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Loading...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content with reveal animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.2,
        }}
      >
        {children}
      </motion.div>
    </>
  )
}

// Simple page transition component without loading screen
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
