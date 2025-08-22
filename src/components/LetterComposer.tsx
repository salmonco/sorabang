'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function LetterComposer() {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording.audioUrl) {
        URL.revokeObjectURL(recording.audioUrl);
      }
    };
  }, [recording.audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecording(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));

        // 스트림 정리
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(prev => ({ ...prev, isRecording: true, duration: 0 }));

      // 타이머 시작
      timerRef.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);

      toast.success('녹음이 시작되었습니다.');
    } catch (error) {
      toast.error('마이크 접근 권한이 필요합니다.');
      console.error('Error accessing microphone:', error);
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

  const playRecording = () => {
    const audio = audioRef.current;
    if (!audio || !recording.audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (recording.audioUrl) {
      URL.revokeObjectURL(recording.audioUrl);
    }
    setRecording({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    });
    setIsPlaying(false);
    toast.success('녹음이 삭제되었습니다.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient.trim()) {
      toast.error('받는 사람을 입력해주세요.');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    
    if (!recording.audioBlob) {
      toast.error('음성 메시지를 녹음해주세요.');
      return;
    }

    // 여기서 실제로는 서버에 편지를 전송하는 로직이 들어갑니다
    toast.success('음성편지가 성공적으로 전송되었습니다! 💌');
    
    // 폼 초기화
    setRecipient('');
    setSubject('');
    setTextMessage('');
    deleteRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          ✍️ 음성편지 쓰기
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 받는 사람 */}
          <div>
            <label className="block text-white font-medium mb-2">
              받는 사람
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="받는 사람의 이름을 입력하세요"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
            />
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-white font-medium mb-2">
              제목
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="편지 제목을 입력하세요"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
            />
          </div>

          {/* 음성 녹음 섹션 */}
          <div>
            <label className="block text-white font-medium mb-4">
              음성 메시지
            </label>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="text-center">
                {!recording.isRecording && !recording.audioBlob && (
                  <motion.button
                    type="button"
                    onClick={startRecording}
                    className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
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
                        onClick={deleteRecording}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="text-white" size={16} />
                      </button>
                    </div>
                    <p className="text-purple-200 text-sm">
                      음성 메시지가 준비되었습니다!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 텍스트 메시지 (선택사항) */}
          <div>
            <label className="block text-white font-medium mb-2">
              텍스트 메시지 (선택사항)
            </label>
            <textarea
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="음성과 함께 전달할 텍스트 메시지를 입력하세요"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all resize-none"
            />
          </div>

          {/* 전송 버튼 */}
          <motion.button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="inline mr-2" size={20} />
            💌 편지 보내기
          </motion.button>
        </form>

        {/* 숨겨진 오디오 엘리먼트 */}
        {recording.audioUrl && (
          <audio
            ref={audioRef}
            src={recording.audioUrl}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>
    </div>
  );
}
