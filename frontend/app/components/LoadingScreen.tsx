"use client";

import { motion } from "framer-motion";
import { LuLoaderCircle } from "react-icons/lu";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({
  message = "Please wait, preparing something amazing...",
}: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 backdrop-blur-md">
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
        className="mb-6"
      >
        <LuLoaderCircle className="w-14 h-14 text-blue-600" strokeWidth={2.5} />
      </motion.div>

      {/* Animated loading text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-blue-900 font-semibold text-xl tracking-wide text-center"
      >
        {message}
      </motion.p>

      {/* Subtle tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-gray-500 text-sm mt-3"
      >
        Optimizing your experience...
      </motion.p>

      {/* Decorative pulse circle */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute w-24 h-24 rounded-full bg-blue-300/20 blur-xl"
      />
    </div>
  );
};

export default LoadingScreen;
