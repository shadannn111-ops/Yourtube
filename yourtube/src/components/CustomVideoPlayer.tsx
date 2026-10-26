import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  SkipBack,
  SkipForward,
  Subtitles,
  Theater,
  Lock,
  Check,
  ChevronLeft,
  Crown,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  QUALITY_OPTIONS,
  SPEED_OPTIONS,
  getMaxQualityForPlan,
  isQualityAllowed,
  getPlanDisplayName,
  getUpgradeMessage,
} from "@/lib/qualityHelper";

interface CustomVideoPlayerProps {
  videoUrl: string;
  poster?: string;
  subtitlesUrl?: string;
  userPlan?: string;
}

export default function CustomVideoPlayer({
  videoUrl,
  poster,
  subtitlesUrl,
  userPlan = "free",
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [lastPosition, setLastPosition] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Settings menu state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<
    "main" | "speed" | "quality"
  >("main");

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentQuality, setCurrentQuality] = useState("Auto");

  const maxQuality = getMaxQualityForPlan(userPlan);

  // ✅ Load last position
  useEffect(() => {
    const savedPosition = localStorage.getItem(`video_position_${videoUrl}`);
    if (savedPosition && parseFloat(savedPosition) > 10) {
      setLastPosition(parseFloat(savedPosition));
      setShowResumePrompt(true);
    }
  }, [videoUrl]);

  // ✅ Close settings menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
        setSettingsView("main");
      }
    };
    if (isSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen]);

  // ✅ Exit theater mode on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTheaterMode) {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isTheaterMode]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((e) => console.log("Play error:", e));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || !isFinite(video.duration)) return;
    const newTime = Math.max(
      0,
      Math.min(video.currentTime + seconds, video.duration)
    );
    if (isFinite(newTime) && !isNaN(newTime)) {
      video.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = value[0];
    setVolume(newVolume);
    video.volume = newVolume;
    video.muted = newVolume === 0;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.log("PiP error:", e);
    }
  };

  const toggleTheaterMode = () => setIsTheaterMode(!isTheaterMode);

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setSettingsView("main");
  };

  const changeQuality = (qualityValue: string, qualityHeight: number) => {
    if (!isQualityAllowed(qualityHeight, userPlan)) {
      return;
    }
    setCurrentQuality(qualityValue);
    setSettingsView("main");
  };

  // ✅ Subtitles toggle
  const toggleSubtitles = () => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;

    if (tracks.length === 0) {
      console.log("⚠️ No subtitle track available");
      return;
    }

    const track = tracks[0];
    const newMode = track.mode === "showing" ? "hidden" : "showing";
    track.mode = newMode;
    setShowSubtitles(newMode === "showing");

    for (let i = 1; i < tracks.length; i++) {
      tracks[i].mode = "hidden";
    }
  };

  const resumeFromLastPosition = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isFinite(lastPosition) && !isNaN(lastPosition)) {
      video.currentTime = lastPosition;
    }
    setShowResumePrompt(false);
  };

  const startFromBeginning = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setShowResumePrompt(false);
  };

  // ✅ Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (isFinite(video.currentTime)) {
        setCurrentTime(video.currentTime);
        localStorage.setItem(
          `video_position_${videoUrl}`,
          video.currentTime.toString()
        );
      }
    };
    const onLoadedMetadata = () => {
      if (isFinite(video.duration)) setDuration(video.duration);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoUrl]);

  // ✅ Keyboard shortcuts (only when hovered/focused)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container) return;

      const activeEl = document.activeElement as HTMLElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const isHovered = container.matches(":hover");
      const isFocused =
        document.activeElement === container ||
        container.contains(document.activeElement);
      const isFullscreenNow = document.fullscreenElement === container;

      if (!isHovered && !isFocused && !isFullscreenNow) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "t":
          toggleTheaterMode();
          break;
        case "p":
          togglePiP();
          break;
        case "c":
          toggleSubtitles();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [togglePlay, volume]);

  // ✅ Hide controls after 3s
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      clearTimeout(timeout);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;
    if (!video.duration || !isFinite(video.duration)) return;

    const rect = progress.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    const newTime = percent * video.duration;

    if (isFinite(newTime) && !isNaN(newTime)) {
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const getQualityLabel = () => {
    if (currentQuality === "Auto") {
      return `Auto (${maxQuality}p)`;
    }
    return currentQuality;
  };

  return (
    <>
      {/* ✅ Theater mode backdrop — full screen dark overlay */}
      {isTheaterMode && (
        <div
          className="fixed inset-0 bg-black/95 z-40 transition-opacity"
          onClick={() => setIsTheaterMode(false)}
        />
      )}

      {/* ✅ Main player container */}
      <div
        ref={containerRef}
        tabIndex={0}
        className={`bg-black overflow-hidden group outline-none transition-all duration-300 ${
          isTheaterMode
            ? "fixed top-14 left-0 right-0 z-50 w-full"
            : "relative w-full rounded-lg"
        }`}
        style={
          isTheaterMode
            ? {
                aspectRatio: "16/9",
                maxHeight: "calc(100vh - 56px)",
              }
            : {
                aspectRatio: "16/9",
                maxHeight: "70vh",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }
        }
      >
        {/* ✅ Theater mode exit button (top right) */}
        {isTheaterMode && (
          <button
            onClick={() => setIsTheaterMode(false)}
            className="absolute top-4 right-4 z-30 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition"
            title="Exit theater mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {showResumePrompt && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <span>Resume from {formatTime(lastPosition)}?</span>
            <button
              onClick={resumeFromLastPosition}
              className="text-blue-400 hover:text-blue-300"
            >
              Resume
            </button>
            <button
              onClick={startFromBeginning}
              className="text-gray-400 hover:text-gray-300"
            >
              Start Over
            </button>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          className="w-full h-full object-contain"
          onClick={togglePlay}
          playsInline
          controls={false}
          crossOrigin="anonymous"
        >
          {/* ✅ English Subtitles track */}
          {subtitlesUrl && (
            <track
              kind="subtitles"
              src={subtitlesUrl}
              srcLang="en"
              label="English"
              default={false}
            />
          )}
        </video>

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}

        {/* ========== CONTROLS BAR ========== */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-2 pt-8 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1 bg-gray-600 rounded-full mb-3 cursor-pointer hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            <div
              className="absolute h-full bg-red-600 rounded-full"
              style={{
                width: `${
                  duration && isFinite(duration)
                    ? (currentTime / duration) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Play/Pause (k)"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Back 10s (←)"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Forward 10s (→)"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              {/* Volume */}
              <div className="flex items-center group/volume ml-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-9 w-9"
                  title="Mute (m)"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange([parseFloat(e.target.value)])
                  }
                  className="w-0 group-hover/volume:w-20 h-1 accent-red-600 cursor-pointer transition-all duration-200"
                />
              </div>

              {/* Time */}
              <span className="text-white text-xs ml-2 tabular-nums select-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-0.5">
              {/* ✅ Subtitles button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSubtitles}
                className={`text-white hover:bg-white/20 h-9 w-9 ${
                  showSubtitles ? "text-red-500 bg-white/10" : ""
                }`}
                title={showSubtitles ? "Subtitles ON (c)" : "Subtitles OFF (c)"}
              >
                <Subtitles className="w-5 h-5" />
              </Button>

              {/* ✅ Theater mode */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheaterMode}
                className={`text-white hover:bg-white/20 h-9 w-9 ${
                  isTheaterMode ? "text-red-500 bg-white/10" : ""
                }`}
                title="Theater mode (t)"
              >
                <Theater className="w-5 h-5" />
              </Button>

              {/* PiP */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Picture in Picture (p)"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </Button>

              {/* Settings menu */}
              <div className="relative" ref={settingsMenuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsSettingsOpen(!isSettingsOpen);
                    setSettingsView("main");
                  }}
                  className={`text-white hover:bg-white/20 h-9 w-9 ${
                    isSettingsOpen ? "bg-white/20" : ""
                  }`}
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                {isSettingsOpen && (
                  <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl z-30 min-w-[260px] border border-white/10 overflow-hidden">
                    {/* MAIN VIEW */}
                    {settingsView === "main" && (
                      <div className="py-1.5">
                        <button
                          onClick={() => setSettingsView("speed")}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-white text-sm transition"
                        >
                          <div className="flex items-center gap-3">
                            <Play className="w-4 h-4" />
                            <span>Playback speed</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <span>
                              {playbackSpeed === 1
                                ? "Normal"
                                : `${playbackSpeed}x`}
                            </span>
                            <ChevronLeft className="w-3 h-3 rotate-180" />
                          </div>
                        </button>

                        <button
                          onClick={() => setSettingsView("quality")}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-white text-sm transition"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            <span>Quality</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <span>{getQualityLabel()}</span>
                            <ChevronLeft className="w-3 h-3 rotate-180" />
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            toggleSubtitles();
                            setSettingsView("main");
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-white text-sm transition"
                        >
                          <div className="flex items-center gap-3">
                            <Subtitles className="w-4 h-4" />
                            <span>Subtitles (English)</span>
                          </div>
                          {showSubtitles && (
                            <Check className="w-4 h-4 text-blue-400" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* SPEED VIEW */}
                    {settingsView === "speed" && (
                      <div className="py-1.5">
                        <button
                          onClick={() => setSettingsView("main")}
                          className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-white/10 text-white text-sm hover:bg-white/10 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="font-medium">Playback speed</span>
                        </button>
                        <div className="max-h-64 overflow-y-auto">
                          {SPEED_OPTIONS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/10 text-white text-sm transition"
                            >
                              <span>
                                {speed === 1 ? "Normal" : `${speed}x`}
                              </span>
                              {playbackSpeed === speed && (
                                <Check className="w-4 h-4 text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QUALITY VIEW */}
                    {settingsView === "quality" && (
                      <div className="py-1.5">
                        <button
                          onClick={() => setSettingsView("main")}
                          className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-white/10 text-white text-sm hover:bg-white/10 transition"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span className="font-medium">Quality</span>
                        </button>

                        <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                          <div className="flex items-center gap-2 text-xs">
                            <Crown className="w-3 h-3 text-yellow-400" />
                            <span className="text-gray-300">
                              {getPlanDisplayName(userPlan)} Plan
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-green-400">
                              Max {maxQuality}p
                            </span>
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                          <button
                            onClick={() => {
                              setCurrentQuality("Auto");
                              setSettingsView("main");
                            }}
                            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/10 text-white text-sm transition"
                          >
                            <span>Auto</span>
                            {currentQuality === "Auto" && (
                              <Check className="w-4 h-4 text-blue-400" />
                            )}
                          </button>

                          {QUALITY_OPTIONS.map((q) => {
                            const allowed = isQualityAllowed(
                              q.height,
                              userPlan
                            );
                            return (
                              <button
                                key={q.value}
                                onClick={() =>
                                  changeQuality(q.value, q.height)
                                }
                                disabled={!allowed}
                                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition ${
                                  allowed
                                    ? "hover:bg-white/10 text-white"
                                    : "text-gray-500 cursor-not-allowed"
                                }`}
                                title={
                                  !allowed ? getUpgradeMessage(q.height) : ""
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span>{q.label}</span>
                                  {!allowed && (
                                    <Lock className="w-3 h-3 text-gray-500" />
                                  )}
                                </div>
                                {currentQuality === q.value && (
                                  <Check className="w-4 h-4 text-blue-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {maxQuality < 2160 && (
                          <Link href="/subscription">
                            <div className="px-4 py-2.5 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-t border-white/10 hover:from-yellow-600/30 hover:to-orange-600/30 cursor-pointer transition">
                              <div className="flex items-center gap-2 text-xs">
                                <Crown className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="text-yellow-300 font-medium">
                                  Upgrade for higher quality
                                </span>
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-9 w-9"
                title="Fullscreen (f)"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}