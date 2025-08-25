"use client";

import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Heart, Mic, Radio, Sparkles, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [roomTitle, setRoomTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomTitle.trim()) {
      toast.error("모임 제목을 입력해주세요.");
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert({ title: roomTitle })
        .select()
        .single();

      if (error) throw error;

      toast.success("모임이 생성되었습니다! 🎉");

      router.push(`/room/${data.id}/manage`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("모임 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block text-8xl mb-4"
            >
              📻
            </motion.div>
          </div>

          <h1 className="handwriting text-7xl font-bold gradient-text mb-4">
            소라방
          </h1>
          <p className="text-purple-700 text-xl mb-2 font-medium">
            소리 라디오 방
          </p>
          <p className="text-purple-600 text-lg mb-4">
            나만을 위한 비밀 라디오 방송
          </p>

          {/* 브랜드 슬로건 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-warm rounded-2xl p-4 mb-6 border border-yellow-200"
          >
            <p className="handwriting text-2xl text-purple-800 font-semibold">
              &ldquo;마음을 녹음하다. 마음을 전하다.&rdquo;
            </p>
          </motion.div>
        </motion.div>

        {/* 메인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-purple rounded-3xl p-8 border border-purple-200 warm-shadow"
        >
          <div className="text-center mb-8">
            <div className="vintage-radio w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Radio className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              새로운 라디오 방 만들기
            </h2>
            <p className="text-purple-600">
              친구들이 따뜻한 목소리를 남길 수 있는 특별한 공간을 만들어보세요
            </p>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-6">
            <div>
              <label className="block text-purple-800 font-medium mb-3 flex items-center space-x-2">
                <Heart className="text-pink-500" size={20} />
                <span>모임 제목</span>
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="예: 지수의 생일 라디오 📻"
                className="w-full px-4 py-4 glass-warm border border-yellow-200 rounded-xl text-purple-800 placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-lg"
                disabled={isCreating}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isCreating}
              className="w-full py-4 purple-gradient text-white font-bold rounded-xl hover:shadow-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-lg purple-shadow"
              whileHover={{ scale: isCreating ? 1 : 1.02 }}
              whileTap={{ scale: isCreating ? 1 : 0.98 }}
            >
              {isCreating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>생성 중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles size={20} />
                  <span>라디오 방 만들기</span>
                </div>
              )}
            </motion.button>
          </form>

          {/* 기능 설명 */}
          <div className="mt-8 pt-8 border-t border-purple-200">
            <h3 className="text-purple-800 font-medium mb-4 text-center handwriting text-xl">
              어떻게 작동하나요?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Users className="text-purple-600" size={20} />
                </div>
                <p className="text-purple-600">
                  <span className="font-medium text-purple-800">
                    1. 모임 생성
                  </span>
                  <br />
                  제목을 입력하고 링크를 만들어요
                </p>
              </div>
              <div className="text-center">
                <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Mic className="text-pink-500" size={20} />
                </div>
                <p className="text-purple-600">
                  <span className="font-medium text-purple-800">
                    2. 친구 초대
                  </span>
                  <br />
                  링크를 공유해서 음성메시지를 받아요
                </p>
              </div>
              <div className="text-center">
                <div className="cassette-tape w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <Radio className="text-orange-500" size={20} />
                </div>
                <p className="text-purple-600">
                  <span className="font-medium text-purple-800">
                    3. 라디오 감상
                  </span>
                  <br />
                  모든 메시지를 라디오처럼 들어요
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 하단 장식 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <div className="heartwave mb-4">
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
            <div className="heartwave-bar"></div>
          </div>
          <p className="handwriting text-purple-600 text-lg">
            볼 순 없어도, 들을 수 있잖아 💜
          </p>
        </motion.div>
      </div>
    </div>
  );
}
