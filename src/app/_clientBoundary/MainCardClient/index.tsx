"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const MainCardClient = ({ children }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-purple rounded-3xl p-4 border border-purple-200 warm-shadow"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          새로운 목소리 방 만들기
        </h2>
        <p className="text-purple-600">
          따뜻한 목소리를 남길 수 있는 특별한 공간을 만들어보세요
        </p>
      </div>
      {children}
    </motion.div>
  );
};
