'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Radio, User, Music } from 'lucide-react';
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



export default function RadioPage({ params }: { params: Promise<{ roomId: string }> }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const { roomId } = resolvedParams;
    
    const savedRoom = localStorage.getItem(`room_${roomId}`);
    if (savedRoom) {
      const data = JSON.parse(savedRoom);
      setRoomData(data);
      
      if (data.messages.length === 0) {
        toast.error('아직 받은 메시지가 없습니다.');
        router.push(`/room/${roomId}/manage`);
      }
    } else {
      toast.error('방을 찾을 수 없습니다.');
      router.push('/');
    }
  }, [resolvedParams, router]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (isAutoPlay && roomData && currentIndex < roomData.messages.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setCurrentTime(0);
        }, 1000);
      }
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isAutoPlay, roomData]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // currentIndex 변경 시 오디오 소스 업데이트
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && roomData && roomData.messages[currentIndex]) {
      const currentMessage = roomData.messages[currentIndex];
      if (currentMessage.audioBlob) {
        audio.src = currentMessage.audioBlob;
        audio.load();
        console.log('Audio source updated for index:', currentIndex);
      }
    }
  }, [currentIndex, roomData]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentMessage) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // base64 데이터 URL 직접 사용
        if (currentMessage.audioBlob) {
          audio.src = currentMessage.audioBlob;
          audio.load();
        }
        
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('오디오를 재생할 수 없습니다.');
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (!roomData || currentIndex >= roomData.messages.length - 1) return;
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setCurrentIndex(prev => prev + 1);
    setCurrentTime(0);
    
    if (isPlaying) {
      setTimeout(async () => {
        try {
          const nextMessage = roomData?.messages[currentIndex + 1];
          if (audio && nextMessage && nextMessage.audioBlob) {
            audio.src = nextMessage.audioBlob;
            audio.load();
            await audio.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Next track playback error:', error);
          toast.error('다음 메시지를 재생할 수 없습니다.');
          setIsPlaying(false);
        }
      }, 100);
    }
  };

  const handlePrevious = () => {
    if (currentIndex <= 0) return;
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setCurrentIndex(prev => prev - 1);
    setCurrentTime(0);
    
    if (isPlaying) {
      setTimeout(async () => {
        try {
          const prevMessage = roomData?.messages[currentIndex - 1];
          if (audio && prevMessage && prevMessage.audioBlob) {
            audio.src = prevMessage.audioBlob;
            audio.load();
            await audio.play();
            setIsPlaying(true);
          }
        } catch (error) {
          console.error('Previous track playback error:', error);
          toast.error('이전 메시지를 재생할 수 없습니다.');
          setIsPlaying(false);
        }
      }, 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!roomData || roomData.messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const currentMessage = roomData.messages[currentIndex];

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
            <Radio size={40} />
            <span>{roomData.title}</span>
          </h1>
          <p className="text-purple-200 text-lg">
            🎧 당신을 위한 라디오 방송
          </p>
        </motion.div>

        {/* 메인 플레이어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 mb-8"
        >
          {/* 현재 재생 중인 메시지 정보 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-8"
            >
              <motion.div
                className="w-48 h-48 mx-auto mb-6 relative"
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                    <User className="text-white" size={32} />
                  </div>
                </div>
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-white/30"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {currentMessage.nickname}님의 메시지
              </h2>
              <div className="flex items-center justify-center space-x-4 text-purple-200">
                <span>{new Date(currentMessage.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 재생 컨트롤 */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="text-white" size={24} />
            </button>
            
            <motion.button
              onClick={handlePlayPause}
              className="p-6 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? (
                <Pause className="text-purple-900" size={40} />
              ) : (
                <Play className="text-purple-900 ml-2" size={40} />
              )}
            </motion.button>
            
            <button
              onClick={handleNext}
              disabled={currentIndex === roomData.messages.length - 1}
              className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="text-white" size={24} />
            </button>
          </div>

          {/* 진행 바 */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{currentIndex + 1} / {roomData.messages.length}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          {/* 볼륨 및 설정 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-white hover:text-purple-200">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <label className="flex items-center space-x-2 text-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoPlay}
                onChange={(e) => setIsAutoPlay(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">자동 재생</span>
            </label>
          </div>

          {/* 숨겨진 오디오 엘리먼트 */}
          {currentMessage?.audioBlob && (
            <audio
              ref={audioRef}
              preload="metadata"
              onError={(e) => {
                console.error('Audio element error:', e);
                console.error('Current audio source:', currentMessage?.audioBlob);
                setIsPlaying(false);
                toast.error('오디오 재생 중 오류가 발생했습니다.');
              }}
              onCanPlay={() => {
                console.log('Audio ready to play');
              }}
              onLoadStart={() => {
                console.log('Audio loading started');
              }}
            />
          )}
        </motion.div>

        {/* 메시지 목록 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4">📻 방송 목록</h3>
          <div className="space-y-3">
            {roomData.messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors ${
                  index === currentIndex
                    ? 'bg-white/20 border border-white/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.pause();
                    setIsPlaying(false);
                  }
                  
                  setCurrentIndex(index);
                  setCurrentTime(0);
                  
                  // 오디오 소스 즉시 업데이트
                  setTimeout(() => {
                    if (audio && message.audioBlob) {
                      audio.src = message.audioBlob;
                      audio.load();
                      console.log('Playlist item clicked, audio source updated:', index);
                    }
                  }, 50);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === currentIndex 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-white/20'
                  }`}>
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{message.nickname}</h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-purple-200 text-sm">
                    {Math.floor(message.duration / 60)}:{(message.duration % 60).toString().padStart(2, '0')}
                  </span>
                  {index === currentIndex && isPlaying && (
                    <div className="text-xs text-purple-300 mt-1">재생 중</div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
