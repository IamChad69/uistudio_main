"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

function CustomSlider({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <motion.div
      className={cn(
        "relative w-full h-1 bg-white/20 rounded-full cursor-pointer",
        className
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        onChange(Math.min(Math.max(percentage, 0), 100));
      }}
    >
      <motion.div
        animate={{ width: `${value}%` }}
        className="absolute left-0 top-0 h-full rounded-full bg-white"
        initial={{ width: 0 }}
        style={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    </motion.div>
  );
}

function VideoPlayer({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        void videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      const newVolume = value / 100;
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(isFinite(progress) ? progress : 0);
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && videoRef.current.duration) {
      const time = (value / 100) * videoRef.current.duration;
      if (isFinite(time)) {
        videoRef.current.currentTime = time;
        setProgress(value);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted) {
      return <VolumeX className="size-5" />;
    }
    if (volume > 0.5) {
      return <Volume2 className="size-5" />;
    }
    return <Volume1 className="size-5" />;
  };

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
        src={src}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={src} type="video/mp4" />
        <track kind="captions" label="English captions" srcLang="en" />
      </video>

      <AnimatePresence>
        {showControls && (
          <motion.div
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            className="absolute inset-x-0 bottom-0 m-4 mx-auto max-w-2xl rounded-2xl bg-black/80 p-6 backdrop-blur-md border border-gray-800"
            exit={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            initial={{ y: 20, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: "circInOut", type: "spring" }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-white font-medium">
                {formatTime(currentTime)}
              </span>
              <CustomSlider
                className="flex-1"
                value={progress}
                onChange={handleSeek}
              />
              <span className="text-sm text-white font-medium">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    className="text-white hover:bg-white/20 hover:text-white bg-white/10 border border-gray-700"
                    size="icon"
                    variant="ghost"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="size-5" />
                    ) : (
                      <Play className="size-5" />
                    )}
                  </Button>
                </motion.div>
                <div className="flex items-center gap-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      className="text-white hover:bg-white/20 hover:text-white bg-white/10 border border-gray-700"
                      size="icon"
                      variant="ghost"
                      onClick={toggleMute}
                    >
                      {getVolumeIcon()}
                    </Button>
                  </motion.div>

                  <div className="w-28">
                    <CustomSlider
                      value={volume * 100}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <motion.div
                    key={speed}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "text-white hover:bg-white/20 hover:text-white bg-white/10 border border-gray-700",
                        playbackSpeed === speed && "bg-white/20 border-white/30"
                      )}
                      onClick={() => setSpeed(speed)}
                    >
                      <span className="text-xs font-medium">{speed}x</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { VideoPlayer };
