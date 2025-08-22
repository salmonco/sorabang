'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Mail, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Letter {
  id: number;
  sender: string;
  subject: string;
  timestamp: string;
  duration: string;
  audioUrl: string;
  textMessage?: string;
  isRead: boolean;
}

const sampleLetters: Letter[] = [
  {
    id: 1,
    sender: "김지수",
    subject: "오늘 하루 어땠어?",
    timestamp: "2024-08-22 14:30",
    duration: "2:15",
    audioUrl: "/audio/letter1.mp3",
    textMessage: "오늘 정말 좋은 하루였어! 너도 좋은 하루 보내길 바라.",
    isRead: false
  },
  {
    id: 2,
    sender: "박민수",
    subject: "생일 축하해!",
    timestamp: "2024-08-21 18:45",
    duration: "1:45",
    audioUrl: "/audio/letter2.mp3",
    textMessage: "생일 정말 축하해! 항상 건강하고 행복하길 바라.",
    isRead: true
  },
  {
    id: 3,
    sender: "이영희",
    subject: "그리운 마음",
    timestamp: "2024-08-20 21:20",
    duration: "3:30",
    audioUrl: "/audio/letter3.mp3",
    isRead: true
  }
];

export default function VoiceLetter() {
  const [letters, setLetters] = useState<Letter[]>(sampleLetters);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleLetterClick = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // 편지를 읽음으로 표시
    if (!letter.isRead) {
      setLetters(prev => 
        prev.map(l => l.id === letter.id ? { ...l, isRead: true } : l)
      );
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !selectedLetter) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        toast.error('음성편지를 재생할 수 없습니다.');
      });
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const unreadCount = letters.filter(letter => !letter.isRead).length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 편지 목록 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">📮 받은 음성편지</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount}개의 새 편지
              </span>
            )}
          </div>

          <div className="space-y-4">
            {letters.map((letter) => (
              <motion.div
                key={letter.id}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedLetter?.id === letter.id
                    ? 'bg-white/20 border border-white/30'
                    : letter.isRead
                    ? 'bg-white/5 hover:bg-white/10'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30'
                }`}
                onClick={() => handleLetterClick(letter)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      letter.isRead ? 'bg-gray-500' : 'bg-purple-500'
                    }`}>
                      <Mail className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="text-purple-200" size={16} />
                        <span className="text-white font-medium">{letter.sender}</span>
                        {!letter.isRead && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <h3 className="text-white font-medium mb-1">{letter.subject}</h3>
                      <div className="flex items-center space-x-4 text-sm text-purple-200">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{letter.timestamp}</span>
                        </div>
                        <span>{letter.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 편지 재생기 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
          {selectedLetter ? (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {selectedLetter.subject}
                </h3>
                <p className="text-purple-200">
                  From: {selectedLetter.sender}
                </p>
                <p className="text-purple-300 text-sm">
                  {selectedLetter.timestamp}
                </p>
              </div>

              {/* 음성 재생 컨트롤 */}
              <div className="text-center mb-6">
                <motion.div
                  className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
                  onClick={handlePlayPause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: isPlaying 
                      ? "0 0 30px rgba(168, 85, 247, 0.5)" 
                      : "0 0 0px rgba(168, 85, 247, 0)" 
                  }}
                >
                  {isPlaying ? (
                    <Pause className="text-white" size={40} />
                  ) : (
                    <Play className="text-white ml-2" size={40} />
                  )}
                </motion.div>

                <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{selectedLetter.duration}</span>
                </div>
                
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* 텍스트 메시지 */}
              {selectedLetter.textMessage && (
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h4 className="text-white font-medium mb-2">💌 함께 전달된 메시지</h4>
                  <p className="text-purple-100 leading-relaxed">
                    {selectedLetter.textMessage}
                  </p>
                </div>
              )}

              {/* 숨겨진 오디오 엘리먼트 */}
              <audio
                ref={audioRef}
                src={selectedLetter.audioUrl}
                preload="metadata"
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="mx-auto text-purple-300 mb-4" size={64} />
              <h3 className="text-xl font-medium text-white mb-2">
                편지를 선택해주세요
              </h3>
              <p className="text-purple-200">
                왼쪽에서 듣고 싶은 음성편지를 클릭하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
