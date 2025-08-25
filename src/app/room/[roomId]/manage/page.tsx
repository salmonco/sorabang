"use client";

import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  Clock,
  Copy,
  Mic,
  Pause,
  Play,
  Radio,
  Share2,
  Square,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";

interface VoiceMessage {
  id: string;
  nickname: string;
  audio_url: string;
  duration: number;
  created_at: string;
}

interface RoomData {
  id: string;
  title: string;
  created_at: string;
  messages: VoiceMessage[];
}

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function RoomManage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [listenUrl, setListenUrl] = useState("");
  const [nickname, setNickname] = useState("");
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const resolvedParams = React.use(params);

  useEffect(() => {
    const { roomId } = resolvedParams;

    const fetchRoomData = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select(
          `
          *,
          messages (*)
        `
        )
        .eq("id", roomId)
        .single();

      if (error) {
        toast.error("방을 찾을 수 없습니다.");
        router.push("/");
      } else {
        setRoomData(data);
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/room/${roomId}/manage`);
        setListenUrl(`${baseUrl}/room/${roomId}/listen`);
      }
    };

    fetchRoomData();
  }, [resolvedParams, router]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} 링크가 복사되었습니다! 📋`);
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const shareLink = async (text: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${roomData?.title} - ${title}`,
          text: "따뜻한 음성 메시지를 남겨주세요!",
          url: text,
        });
      } catch {
        copyToClipboard(text, title);
      }
    } else {
      copyToClipboard(text, title);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        mimeType = "audio/wav";
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

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;

          setRecording((prev) => ({
            ...prev,
            audioBlob,
            audioUrl: base64Audio,
            isRecording: false,
          }));
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording((prev) => ({ ...prev, isRecording: true, duration: 0 }));

      timerRef.current = setInterval(() => {
        setRecording((prev) => {
          if (prev.duration >= 120) {
            // 2분 제한
            stopRecording();
            return prev;
          }
          return { ...prev, duration: prev.duration + 1 };
        });
      }, 1000);

      toast.success("녹음이 시작되었습니다. (최대 2분)");
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      toast.success("녹음이 완료되었습니다.");
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
        audio.src = recording.audioUrl;
        audio.load();

        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      toast.error("음성을 재생할 수 없습니다. 다시 녹음해주세요.");
      setIsPlaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요.");
      return;
    }

    if (!recording.audioBlob) {
      toast.error("음성 메시지를 녹음해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const audioFile = new File([recording.audioBlob], `${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const { data: fileData, error: fileError } = await supabase.storage
        .from("voice-messages")
        .upload(`${roomData!.id}/${audioFile.name}`, audioFile);

      if (fileError) throw fileError;

      const { data: urlData } = supabase.storage
        .from("voice-messages")
        .getPublicUrl(fileData.path);

      const newMessage = {
        room_id: roomData!.id,
        nickname: nickname.trim(),
        audio_url: urlData.publicUrl,
        duration: recording.duration,
      };

      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert(newMessage)
        .select()
        .single();

      if (messageError) throw messageError;

      setRoomData((prev) =>
        prev ? { ...prev, messages: [...prev.messages, messageData] } : null
      );

      toast.success("음성 메시지가 추가되었습니다! 💌");

      // Reset recording state
      setRecording({
        isRecording: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      });
      setNickname("");

      // Show confetti
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("메시지 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      {showConfetti && <Confetti />}
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
            생성일: {new Date(roomData.created_at).toLocaleDateString("ko-KR")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <h2 className="handwriting text-2xl font-bold text-purple-800 mb-2">
                음성 녹음 및 관리
              </h2>
              <p className="text-purple-600 text-sm">
                이 링크를 친구들에게 공유해서 음성 메시지를 받아보세요.
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-purple rounded-xl p-4 border border-purple-200">
                <p className="text-purple-700 text-sm break-all font-mono">
                  {shareUrl}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(shareUrl, "녹음 및 관리")}
                  className="flex-1 py-3 glass-purple text-purple-700 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2 border border-purple-200"
                >
                  <Copy size={18} />
                  <span>복사</span>
                </button>
                <button
                  onClick={() => shareLink(shareUrl, "녹음 및 관리")}
                  className="flex-1 py-3 cream-gradient text-purple-800 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <Share2 size={18} />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 라디오 링크 공유 카드 */}
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
              <h2 className="handwriting text-2xl font-bold text-purple-800 mb-2">
                라디오 방송 듣기
              </h2>
              <p className="text-purple-600 text-sm">
                모든 음성 메시지를 라디오처럼 들으려면 이 링크를 공유하세요.
              </p>
            </div>

            <div className="space-y-4">
              <div className="glass-purple rounded-xl p-4 border border-purple-200">
                <p className="text-purple-700 text-sm break-all font-mono">
                  {listenUrl}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(listenUrl, "라디오 듣기")}
                  className="flex-1 py-3 glass-purple text-purple-700 rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2 border border-purple-200"
                >
                  <Copy size={18} />
                  <span>복사</span>
                </button>
                <button
                  onClick={() => shareLink(listenUrl, "라디오 듣기")}
                  className="flex-1 py-3 cream-gradient text-purple-800 rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-medium"
                >
                  <Share2 size={18} />
                  <span>공유</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* 음성 녹음 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-purple rounded-3xl p-6 border border-purple-200 purple-shadow"
          >
            <div className="text-center mb-6">
              <div className="cassette-tape w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mic className="text-purple-600" size={24} />
              </div>
              <h2 className="handwriting text-2xl font-bold text-purple-800 mb-2">
                음성 메시지 남기기
              </h2>
              <p className="text-purple-600 text-sm">
                직접 음성 메시지를 녹음할 수 있습니다.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-purple-800 font-medium mb-2 flex items-center space-x-2">
                  <User size={16} />
                  <span>닉네임</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                  disabled={isSubmitting}
                  maxLength={20}
                />
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-center">
                  {!recording.isRecording && !recording.audioBlob && (
                    <motion.button
                      type="button"
                      onClick={startRecording}
                      className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg mx-auto"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mic className="text-white" size={24} />
                    </motion.button>
                  )}

                  {recording.isRecording && (
                    <div className="space-y-2">
                      <motion.div
                        className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Mic className="text-white" size={24} />
                      </motion.div>
                      <p className="text-white font-medium">
                        녹음 중... {formatTime(recording.duration)}
                      </p>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-4 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Square className="inline mr-1" size={12} />
                        녹음 중지
                      </button>
                    </div>
                  )}

                  {recording.audioBlob && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={playRecording}
                          className="p-2 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="text-white" size={16} />
                          ) : (
                            <Play className="text-white ml-0.5" size={16} />
                          )}
                        </button>
                        <span className="text-white text-sm">
                          녹음 시간: {formatTime(recording.duration)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setRecording({
                              isRecording: false,
                              duration: 0,
                              audioBlob: null,
                              audioUrl: null,
                            });
                            setIsPlaying(false);
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs"
                        >
                          다시 녹음
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={
                  isSubmitting || !recording.audioBlob || !nickname.trim()
                }
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? "전송 중..." : "메시지 남기기"}
              </motion.button>
            </form>
            {recording.audioUrl && (
              <audio
                ref={audioRef}
                src={recording.audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
            )}
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
                        <p className="text-purple-800 font-medium">
                          {message.nickname}
                        </p>
                        <p className="text-purple-600 text-sm">
                          {new Date(message.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-600 text-sm">
                      <Clock size={14} />
                      <span>
                        {Math.floor(message.duration / 60)}:
                        {(message.duration % 60).toString().padStart(2, "0")}
                      </span>
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
