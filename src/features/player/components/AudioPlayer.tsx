"use client";

import { useCallback, useMemo } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import type { Lesson, PlaybackSpeed } from "@/types";

interface AudioPlayerProps {
  lesson: Lesson;
  playlist?: Lesson[];
  onPrevious?: () => void;
  onNext?: () => void;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  lesson,
  playlist = [],
  onPrevious,
  onNext,
  onTimeUpdate,
  className,
}: AudioPlayerProps) {
  const currentIndex = playlist.findIndex((l) => l.id === lesson.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < playlist.length - 1;

  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    speed,
    isLoading,
    error,
    abLoop,
    toggle,
    seek,
    setVolume,
    setSpeed,
    setPointA,
    setPointB,
    clearABLoop,
  } = useAudioPlayer({
    src: lesson.audio_url,
    onEnd: hasNext ? onNext : undefined,
    onTimeUpdate,
  });

  const handleSeek = useCallback(
    (value: number[]) => {
      seek(value[0]);
    },
    [seek]
  );

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0]);
    },
    [setVolume]
  );

  const cycleSpeed = useCallback(() => {
    const currentIndex = SPEEDS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    setSpeed(SPEEDS[nextIndex]);
  }, [speed, setSpeed]);

  const abLoopIndicator = useMemo(() => {
    if (!abLoop.pointA && !abLoop.pointB) return null;
    const aPercent = abLoop.pointA !== null ? (abLoop.pointA / duration) * 100 : 0;
    const bPercent = abLoop.pointB !== null ? (abLoop.pointB / duration) * 100 : aPercent;
    return { left: `${aPercent}%`, width: `${bPercent - aPercent}%` };
  }, [abLoop, duration]);

  if (error) {
    return <div className={cn("p-4 text-center text-destructive", className)}>{error}</div>;
  }

  return (
    <div className={cn("space-y-4 p-4 bg-card rounded-lg", className)}>
      {/* Title */}
      <div className="text-center">
        <h3 className="font-medium truncate">{lesson.name}</h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          {abLoopIndicator && (
            <div
              className="absolute top-1/2 -translate-y-1/2 h-2 bg-primary/30 rounded"
              style={abLoopIndicator}
            />
          )}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={onPrevious} disabled={!hasPrevious}>
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          className="h-12 w-12"
          onClick={toggle}
          disabled={isLoading}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={onNext} disabled={!hasNext}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between">
        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
          >
            {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        {/* Speed */}
        <Button variant="outline" size="sm" onClick={cycleSpeed} className="min-w-[60px]">
          {speed}x
        </Button>

        {/* AB Loop */}
        <div className="flex items-center gap-1">
          <Button
            variant={abLoop.pointA !== null ? "secondary" : "ghost"}
            size="sm"
            onClick={setPointA}
          >
            A
          </Button>
          <Button
            variant={abLoop.pointB !== null ? "secondary" : "ghost"}
            size="sm"
            onClick={setPointB}
            disabled={abLoop.pointA === null}
          >
            B
          </Button>
          {abLoop.enabled && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearABLoop}>
              <Repeat className="h-4 w-4 text-primary" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
