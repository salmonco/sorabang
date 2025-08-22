'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Heart, Sparkles, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuccessPage({ params }: { params: Promise<{ roomId: string }> }) {
  const [roomTitle, setRoomTitle] = useState('');
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const { roomId } = resolvedParams;
    
    const savedRoom = localStorage.getItem(`room_${roomId}`);
    if (savedRoom) {
      const data = JSON.parse(savedRoom);
      setRoomTitle(data.title);
    }
  }, [resolvedParams]);

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 성공 애니메이션 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1 
          }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mx-auto mb-6"
            >
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="text-white" size={64} />
              </div>
            </motion.div>
            
            {/* 반짝이는 효과 */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-yellow-300 rounded-full"
                style={{
                  top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 80}px`,
                  left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 80}px`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles size={16} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            메시지가 전달되었습니다! 💌
          </h1>
          <p className="text-xl text-purple-200 mb-2">
            따뜻한 마음이 담긴 목소리가
          </p>
          <p className="text-xl text-purple-200 mb-6">
            <span className="font-semibold text-white">{roomTitle}</span>에 도착했어요
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-center space-x-2 text-pink-300 mb-3">
              <Heart className="fill-current" size={20} />
              <span className="font-medium">감사합니다</span>
              <Heart className="fill-current" size={20} />
            </div>
            <p className="text-purple-100 leading-relaxed">
              당신의 소중한 음성 메시지가 특별한 사람에게 전달되어<br />
              더욱 의미있는 순간을 만들어줄 거예요.
            </p>
          </div>
        </motion.div>

        {/* 액션 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <motion.button
            onClick={goHome}
            className="w-full max-w-md py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Home size={20} />
              <span>새로운 라디오 방 만들기</span>
            </div>
          </motion.button>
          
          <p className="text-purple-300 text-sm">
            더 많은 사람들과 따뜻한 메시지를 나누어보세요
          </p>
        </motion.div>

        {/* 장식적 요소 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center space-x-4 text-purple-300">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-purple-300"></div>
            <span className="text-2xl">🎵</span>
            <span className="font-medium">소라방</span>
            <span className="text-2xl">🎵</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-purple-300"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
