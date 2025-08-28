"use client";

import { motion } from "framer-motion";

export const LetterAnimationClient = () => {
  return (
    <motion.div
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block text-8xl mb-4"
    >
      💌
    </motion.div>
  );
};
