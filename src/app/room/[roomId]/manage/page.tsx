'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Copy, Share2, Radio, Users, Play, Clock, User, Heart, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface VoiceMessage {
  id: string;
  nickname: string;
  audioBlob: string;
  bgMusic: string;
  duration: number;
  createdAt: string;
}

interface RoomData {
  id: string;
  title: string;
  createdAt: string;
  messages: VoiceMessage[];
}

export default function RoomManage({ params }: { params: Promise<{ roomId: string }> }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const { roomId } = resolvedParams;
    
    // 로컬 스토리지에서 방 데이터 로드
    const savedRoom = localStorage.getItem(`room_${roomId}`);
    if (savedRoom) {
      const data = JSON.parse(savedRoom);
      setRoomData(data);
      
      // 공유 URL 생성
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/room/${roomId}/join`);
    } else {
      toast.error('방을 찾을 수 없습니다.');
      router.push('/');
    }
  }, [resolvedParams, router]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 복사되었습니다! 📋');
    } catch (error) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${roomData?.title} - 소라방`,
          text: '따뜻한 음성 메시지를 남겨주세요!',
          url: shareUrl,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const goToRadio = () => {
    router.push(`/room/${resolvedParams.roomId}/radio`);
  };

  if (!roomData) {
    return (
      <div className="min-h-screen warm-gradient flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen warm-gradient p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block text-6xl"
            >
              📻
            </motion.div>
          </div>
          <h1 className="handwriting text-5xl font-bold gradient-text mb-2">
            {roomData.title}
          </h1>
          <p className="text-purple-600">
            생성일: {new Date(roomData.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 링크 공유 카드 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-warm rounded-3xl p-6 border border-yellow-200 warm-shadow"
          >
            <div className="text-center mb-6">
              <div className="vintage-radio w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Share2 className="text-white" size={24} />
              </div>
              <h2 className="handwriting text-2xl font-bold text-purple-800 mb-2">친구들 초대하기</h2>
              <p className="text-purple-600 text-sm">
                이 링크를 공유해서 따뜻한 음성 메시지를 받아보세요
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-purple rounded-xl p-4 border border-purple-200">
                <p className="text-purple-700 text-sm break-all font-mono">{shareUrl}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 glass-purple text-purple-700 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2 border border-purple-200"
                >
                  <Copy size={18} />
                  <span>복사</span>
                </button>
                <button
                  onClick={shareLink}
                  className="flex-1 py-3 cream-gradient text-purple-800 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <Share2 size={18} />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 라디오 재생 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-purple rounded-3xl p-6 border border-purple-200 purple-shadow"
          >
            <div className="text-center mb-6">
              <div className="cassette-tape w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Radio className="text-purple-600" size={24} />
              </div>
              <h2 className="handwriting text-2xl font-bold text-purple-800 mb-2">라디오 방송 듣기</h2>
              <p className="text-purple-600 text-sm">
                받은 음성 메시지들을 라디오처럼 감상하세요
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Heart className="text-pink-500" size={20} />
                <div className="text-3xl font-bold text-purple-800">
                  {roomData.messages.length}
                </div>
                <Heart className="text-pink-500" size={20} />
              </div>
              <p className="text-purple-600">개의 따뜻한 메시지</p>
            </div>

            <button
              onClick={goToRadio}
              disabled={roomData.messages.length === 0}
              className="w-full py-3 purple-gradient text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
            >
              <Play size={18} />
              <span>
                {roomData.messages.length === 0 ? '메시지를 기다리는 중...' : '라디오 방송 시작'}
              </span>
            </button>
          </motion.div>
        </div>

        {/* 받은 메시지 목록 */}
        {roomData.messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 glass-warm rounded-3xl p-6 border border-yellow-200 warm-shadow"
          >
            <h3 className="handwriting text-2xl font-bold text-purple-800 mb-6 flex items-center space-x-2">
              <Users size={20} />
              <span>받은 음성 메시지</span>
            </h3>
            
            <div className="space-y-4">
              {roomData.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-purple rounded-xl p-4 border border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="cassette-tape w-10 h-10 flex items-center justify-center">
                        <User className="text-purple-600" size={16} />
                      </div>
                      <div>
                        <p className="text-purple-800 font-medium">{message.nickname}</p>
                        <p className="text-purple-600 text-sm">
                          {new Date(message.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-600 text-sm">
                      <Clock size={14} />
                      <span>{Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 하단 장식 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
            소리로 전하는 마음, 하루가 특별해지는 마법 ✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}
