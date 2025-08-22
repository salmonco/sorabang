'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Mic, Square, Play, Pause, Send, Music, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

interface RoomData {
  id: string;
  title: string;
  createdAt: string;
  messages: any[];
}

const bgMusicOptions = [
  { id: 'none', name: '배경음악 없음', preview: null },
  { id: 'gentle', name: '잔잔한 피아노', preview: '/audio/gentle-piano.mp3' },
  { id: 'acoustic', name: '어쿠스틱 기타', preview: '/audio/acoustic-guitar.mp3' },
  { id: 'ambient', name: '따뜻한 앰비언트', preview: '/audio/warm-ambient.mp3' },
  { id: 'jazz', name: '부드러운 재즈', preview: '/audio/soft-jazz.mp3' },
];

export default function JoinRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [nickname, setNickname] = useState('');
  const [selectedBgMusic, setSelectedBgMusic] = useState('none');
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const { roomId } = resolvedParams;
    
    // 로컬 스토리지에서 방 데이터 로드
    const savedRoom = localStorage.getItem(`room_${roomId}`);
    if (savedRoom) {
      const data = JSON.parse(savedRoom);
      setRoomData(data);
    } else {
      toast.error('방을 찾을 수 없습니다.');
      router.push('/');
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // base64 데이터 URL은 자동으로 가비지 컬렉션됨
    };
  }, [resolvedParams, router, recording.audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // 브라우저별 MIME 타입 지원 확인
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Blob을 base64로 변환하여 저장
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          
          console.log('Recording completed:', { 
            blobSize: audioBlob.size, 
            mimeType: audioBlob.type,
            base64Length: base64Audio.length
          });
          
          setRecording(prev => ({
            ...prev,
            audioBlob,
            audioUrl: base64Audio, // base64 데이터 URL 저장
            isRecording: false,
          }));
        };
        reader.readAsDataURL(audioBlob);

        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(prev => ({ ...prev, isRecording: true, duration: 0 }));

      timerRef.current = setInterval(() => {
        setRecording(prev => {
          if (prev.duration >= 120) { // 2분 제한
            stopRecording();
            return prev;
          }
          return { ...prev, duration: prev.duration + 1 };
        });
      }, 1000);

      toast.success('녹음이 시작되었습니다. (최대 2분)');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast.success('녹음이 완료되었습니다.');
    }
  };

  const playRecording = async () => {
    const audio = audioRef.current;
    if (!audio || !recording.audioUrl) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // base64 데이터 URL을 직접 사용
        audio.src = recording.audioUrl;
        audio.load();
        
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('음성을 재생할 수 없습니다. 다시 녹음해주세요.');
      setIsPlaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }
    
    if (!recording.audioBlob) {
      toast.error('음성 메시지를 녹음해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 새 메시지 생성
      const newMessage = {
        id: Math.random().toString(36).substring(2, 15),
        nickname: nickname.trim(),
        audioBlob: recording.audioUrl!, // base64 데이터 URL 저장
        bgMusic: selectedBgMusic,
        duration: recording.duration,
        createdAt: new Date().toISOString(),
      };

      // 방 데이터 업데이트
      const updatedRoom = {
        ...roomData!,
        messages: [...roomData!.messages, newMessage],
      };

      localStorage.setItem(`room_${resolvedParams.roomId}`, JSON.stringify(updatedRoom));
      
      toast.success('음성 메시지가 전달되었습니다! 💌');
      
      // 성공 페이지로 이동
      router.push(`/room/${resolvedParams.roomId}/success`);
      
    } catch (error) {
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            🎵 {roomData.title}
          </h1>
          <p className="text-purple-200 text-lg">
            따뜻한 목소리를 남겨주세요
          </p>
        </motion.div>

        {/* 메인 폼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 닉네임 입력 */}
            <div>
              <label className="block text-white font-medium mb-3 flex items-center space-x-2">
                <User size={20} />
                <span>나만의 닉네임</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 친구 민수, 동생 지영"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                disabled={isSubmitting}
                maxLength={20}
              />
            </div>

            {/* 배경음악 선택 */}
            <div>
              <label className="block text-white font-medium mb-3 flex items-center space-x-2">
                <Music size={20} />
                <span>배경음악 선택</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bgMusicOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedBgMusic(option.id)}
                    className={`p-3 rounded-xl border transition-all text-left ${
                      selectedBgMusic === option.id
                        ? 'bg-purple-500/30 border-purple-400 text-white'
                        : 'bg-white/10 border-white/20 text-purple-200 hover:bg-white/20'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 음성 녹음 */}
            <div>
              <label className="block text-white font-medium mb-4 flex items-center space-x-2">
                <Mic size={20} />
                <span>음성 메시지 (최대 2분)</span>
              </label>
              
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="text-center">
                  {!recording.isRecording && !recording.audioBlob && (
                    <motion.button
                      type="button"
                      onClick={startRecording}
                      className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mic className="text-white" size={32} />
                    </motion.button>
                  )}

                  {recording.isRecording && (
                    <div className="space-y-4">
                      <motion.div
                        className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Mic className="text-white" size={32} />
                      </motion.div>
                      <p className="text-white font-medium">
                        녹음 중... {formatTime(recording.duration)}
                      </p>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Square className="inline mr-2" size={16} />
                        녹음 중지
                      </button>
                    </div>
                  )}

                  {recording.audioBlob && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          type="button"
                          onClick={playRecording}
                          className="p-3 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="text-white" size={24} />
                          ) : (
                            <Play className="text-white ml-1" size={24} />
                          )}
                        </button>
                        <span className="text-white">
                          녹음 시간: {formatTime(recording.duration)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            // base64 데이터는 URL.revokeObjectURL 불필요
                            setRecording({
                              isRecording: false,
                              duration: 0,
                              audioBlob: null,
                              audioUrl: null,
                            });
                            setIsPlaying(false);
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          다시 녹음
                        </button>
                      </div>
                      <p className="text-purple-200 text-sm">
                        음성 메시지가 준비되었습니다! ✨
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 전송 버튼 */}
            <motion.button
              type="submit"
              disabled={isSubmitting || !recording.audioBlob || !nickname.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner"></div>
                  <span>전송 중...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Send size={20} />
                  <span>💌 따뜻한 메시지 전달하기</span>
                </div>
              )}
            </motion.button>
          </form>

          {/* 숨겨진 오디오 엘리먼트 */}
          {recording.audioUrl && (
            <audio
              ref={audioRef}
              src={recording.audioUrl}
              preload="metadata"
              onEnded={() => setIsPlaying(false)}
              onError={(e) => {
                console.error('Audio element error:', e);
                setIsPlaying(false);
                toast.error('오디오 재생 중 오류가 발생했습니다.');
              }}
              onCanPlay={() => {
                console.log('Audio can play');
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
