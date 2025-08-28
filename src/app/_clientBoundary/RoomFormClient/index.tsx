"use client";

import { logAmplitudeEvent } from "@/lib/analytics";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export const RoomFormClient = () => {
  const router = useRouter();

  const [roomTitle, setRoomTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    logAmplitudeEvent("create_room_attempt", {
      room_title: roomTitle,
    });

    if (!roomTitle.trim()) {
      toast.error("목소리 방 제목을 입력해주세요.");
      return;
    }

    setIsCreating(true);

    try {
      const roomId = Math.random().toString(36).substring(2, 8);
      const { data, error } = await supabase
        .from("rooms")
        .insert({ id: roomId, title: roomTitle })
        .select()
        .single();

      if (error) throw error;

      logAmplitudeEvent("create_room_success", {
        room_id: data.id,
        room_title: roomTitle,
      });

      toast.success("목소리 방이 생성되었습니다! 🎉");

      router.push(`/room/${data.id}/manage`);
    } catch (error) {
      logAmplitudeEvent("create_room_failure", {
        room_title: roomTitle,
        error,
      });

      console.error("Error creating room:", error);
      toast.error("목소리 방 생성에 실패했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-6">
      <div>
        <label
          className="text-purple-800 font-medium mb-3 flex items-center space-x-2"
          htmlFor="roomTitle"
        >
          <Heart className="text-pink-500" size={20} />
          <span>목소리 방 제목</span>
        </label>
        <input
          type="text"
          name="roomTitle"
          id="roomTitle"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          placeholder="예: 지수의 생일 편지 💌"
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
            <span className="text-lg">목소리 방 만들기</span>
          </div>
        )}
      </motion.button>
    </form>
  );
};
