'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Copy, Share2, Radio, Users, Play, Clock, User } from 'lucide-react';
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
          text: '음성 메시지를 남겨주세요!',
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🎵 {roomData.title}
          </h1>
          <p className="text-purple-200">
            생성일: {new Date(roomData.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 링크 공유 카드 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">친구들 초대하기</h2>
              <p className="text-purple-200 text-sm">
                이 링크를 공유해서 음성 메시지를 받아보세요
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <p className="text-white text-sm break-all">{shareUrl}</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center space-x-2"
                >
                  <Copy size={18} />
                  <span>복사</span>
                </button>
                <button
                  onClick={shareLink}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
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
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Radio className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">라디오 방송 듣기</h2>
              <p className="text-purple-200 text-sm">
                받은 음성 메시지들을 라디오처럼 감상하세요
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-white mb-2">
                {roomData.messages.length}
              </div>
              <p className="text-purple-200">개의 음성 메시지</p>
            </div>

            <button
              onClick={goToRadio}
              disabled={roomData.messages.length === 0}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            className="mt-8 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Users size={20} />
              <span>받은 음성 메시지</span>
            </h3>
            
            <div className="space-y-4">
              {roomData.messages.map((message, index) => (
                <div
                  key={message.id}
                  className="bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="text-white" size={16} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{message.nickname}</p>
                        <p className="text-purple-200 text-sm">
                          {new Date(message.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-200 text-sm">
                      <Clock size={14} />
                      <span>{Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
