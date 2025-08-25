'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  url: string;
}

const sampleTracks: Track[] = [
  {
    id: 1,
    title: "감성 재즈 카페",
    artist: "소라방 DJ",
    duration: "3:45",
    url: "/audio/sample1.mp3"
  },
  {
    id: 2,
    title: "밤하늘의 멜로디",
    artist: "소라방 DJ",
    duration: "4:12",
    url: "/audio/sample2.mp3"
  },
  {
    id: 3,
    title: "따뜻한 오후의 편지",
    artist: "소라방 DJ",
    duration: "3:28",
    url: "/audio/sample3.mp3"
  }
];

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [currentTrack]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        toast.error('오디오를 재생할 수 없습니다.');
      });
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % sampleTracks.length);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + sampleTracks.length) % sampleTracks.length);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrackData = sampleTracks[currentTrack];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
        {/* 현재 재생 중인 트랙 정보 */}
        <div className="text-center mb-8">
          <motion.div
            className="w-48 h-48 mx-auto mb-6 relative"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentTrackData.title}
          </h2>
          <p className="text-purple-200 text-lg">
            {currentTrackData.artist}
          </p>
        </div>

        {/* 재생 컨트롤 */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={handlePlayPause}
            className="p-4 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause className="text-purple-900" size={32} />
            ) : (
              <Play className="text-purple-900 ml-1" size={32} />
            )}
          </button>
        </div>

        {/* 진행 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* 볼륨 컨트롤 */}
        <div className="flex items-center justify-center space-x-4">
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

        {/* 숨겨진 오디오 엘리먼트 */}
        <audio
          ref={audioRef}
          src={currentTrackData.url}
          preload="metadata"
        />
      </div>
    </div>
  );
}
