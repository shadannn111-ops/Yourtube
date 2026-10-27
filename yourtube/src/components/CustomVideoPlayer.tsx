import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings,
  PictureInPicture2, SkipBack, SkipForward, Subtitles, Theater,
  Lock, Check, ChevronLeft, Crown, X,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  QUALITY_OPTIONS,
  SPEED_OPTIONS,
  getMaxQualityForPlan,
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

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "speed" | "quality">("main");

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentQuality, setCurrentQuality] = useState("Auto");

  // ✅ Plan check function
  const maxQuality = getMaxQualityForPlan(userPlan);
  const isAllowed = (height: number) => height <= maxQuality;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
        setSettingsView("main");
      }
    };
    if (isSettingsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSettingsOpen]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play().catch((e) => console.log(e)); setIsPlaying(true); } 
    else { video.pause(); setIsPlaying(false); }
  }, []);

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
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
    if (!document.fullscreenElement) container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    else document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
  };

  const changeQuality = (qualityValue: string, qualityHeight: number) => {
    if (!isAllowed(qualityHeight)) return;
    setCurrentQuality(qualityValue);
    setSettingsView("main");
  };

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setSettingsView("main");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => { if (isFinite(video.currentTime)) setCurrentTime(video.currentTime); };
    const onLoadedMetadata = () => { if (isFinite(video.duration)) setDuration(video.duration); };
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [videoUrl]);

  return (
    <div ref={containerRef} tabIndex={0} className="bg-black overflow-hidden group outline-none relative w-full rounded-lg" style={{ aspectRatio: "16/9", maxHeight: "70vh" }}>
      <video ref={videoRef} src={videoUrl} poster={poster} className="w-full h-full object-contain" onClick={togglePlay} playsInline crossOrigin="anonymous">
        {subtitlesUrl && <track kind="subtitles" src={subtitlesUrl} srcLang="en" label="English" default={false} />}
      </video>

      {isBuffering && <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" /></div>}

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition"><Play className="w-8 h-8 text-white fill-white" /></div>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-8 transition-opacity ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div ref={progressRef} className="relative h-1 bg-gray-600 rounded-full mb-3 cursor-pointer hover:h-1.5 transition-all" onClick={(e) => {
          const video = videoRef.current; const progress = progressRef.current;
          if (!video || !progress || !video.duration) return;
          const rect = progress.getBoundingClientRect();
          video.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * video.duration;
        }}>
          <div className="absolute h-full bg-red-600 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-9 w-9">{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</Button>
            <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20 h-9 w-9"><SkipBack className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20 h-9 w-9"><SkipForward className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-9 w-9">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</Button>
            <span className="text-white text-xs ml-2 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowSubtitles(!showSubtitles)} className={`text-white hover:bg-white/20 h-9 w-9 ${showSubtitles ? "text-red-500 bg-white/10" : ""}`}><Subtitles className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 h-9 w-9">{isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}</Button>
            
            <div className="relative" ref={settingsMenuRef}>
              <Button variant="ghost" size="icon" onClick={() => { setIsSettingsOpen(!isSettingsOpen); setSettingsView("main"); }} className={`text-white hover:bg-white/20 h-9 w-9 ${isSettingsOpen ? "bg-white/20" : ""}`}><Settings className="w-5 h-5" /></Button>

              {isSettingsOpen && (
                <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl z-30 min-w-[260px] border border-white/10 overflow-hidden text-white">
                  {settingsView === "main" && (
                    <div className="py-1.5">
                      <button onClick={() => setSettingsView("speed")} className="w-full flex justify-between px-4 py-2.5 hover:bg-white/10 text-sm"><span>Playback speed</span><span className="text-gray-400">{playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}</span></button>
                      <button onClick={() => setSettingsView("quality")} className="w-full flex justify-between px-4 py-2.5 hover:bg-white/10 text-sm"><span>Quality</span><span className="text-gray-400">{currentQuality}</span></button>
                    </div>
                  )}

                  {settingsView === "speed" && (
                    <div className="py-1.5">
                      <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-white/10 text-sm hover:bg-white/10"><ChevronLeft className="w-4 h-4" />Playback speed</button>
                      {SPEED_OPTIONS.map((s) => (
                        <button key={s} onClick={() => changePlaybackSpeed(s)} className="w-full flex justify-between px-4 py-2 hover:bg-white/10 text-sm"><span>{s === 1 ? "Normal" : `${s}x`}</span>{playbackSpeed === s && <Check className="w-4 h-4 text-blue-400" />}</button>
                      ))}
                    </div>
                  )}

                  {settingsView === "quality" && (
                    <div className="py-1.5">
                      <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-white/10 text-sm hover:bg-white/10"><ChevronLeft className="w-4 h-4" />Quality</button>
                      <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center gap-2 text-xs"><Crown className="w-3 h-3 text-yellow-400" /><span className="text-gray-300">{getPlanDisplayName(userPlan)} Plan</span><span className="text-gray-500">•</span><span className="text-green-400">Max {maxQuality}p</span></div>
                      
                      <button onClick={() => { setCurrentQuality("Auto"); setSettingsView("main"); }} className="w-full flex justify-between px-4 py-2 hover:bg-white/10 text-sm"><span>Auto</span>{currentQuality === "Auto" && <Check className="w-4 h-4 text-blue-400" />}</button>
                      
                      {QUALITY_OPTIONS.map((q) => {
                        const allowed = isAllowed(q.height); // ✅ Yahan check ho raha hai
                        return (
                          <button key={q.value} onClick={() => changeQuality(q.value, q.height)} disabled={!allowed} className={`w-full flex justify-between px-4 py-2 text-sm ${allowed ? "hover:bg-white/10" : "text-gray-500 cursor-not-allowed"}`} title={!allowed ? getUpgradeMessage(q.height) : ""}>
                            <div className="flex items-center gap-2"><span>{q.label}</span>{!allowed && <Lock className="w-3 h-3 text-gray-500" />}</div>
                            {currentQuality === q.value && <Check className="w-4 h-4 text-blue-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
