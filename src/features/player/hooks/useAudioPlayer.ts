import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import type { PlaybackSpeed, PlayerState, ABLoopState } from "@/types";

interface UseAudioPlayerOptions {
  src: string;
  onEnd?: () => void;
  onTimeUpdate?: (time: number) => void;
}

const SPEED_KEY = "player_speed_preference";

function getInitialSpeed(): PlaybackSpeed {
  if (typeof window === "undefined") return 1;
  const saved = localStorage.getItem(SPEED_KEY);
  return saved ? (parseFloat(saved) as PlaybackSpeed) : 1;
}

export function useAudioPlayer({ src, onEnd, onTimeUpdate }: UseAudioPlayerOptions) {
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number | null>(null);
  const abLoopRef = useRef<ABLoopState>({ enabled: false, pointA: null, pointB: null });
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onEndRef = useRef(onEnd);

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    speed: getInitialSpeed(),
    isLoading: true,
    error: null,
  });

  const [abLoop, setABLoop] = useState<ABLoopState>({
    enabled: false,
    pointA: null,
    pointB: null,
  });

  // Keep refs in sync
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    abLoopRef.current = abLoop;
  }, [abLoop]);

  useEffect(() => {
    if (!src) return;

    const initialSpeed = getInitialSpeed();

    const updateTime = () => {
      if (!howlRef.current) return;

      const currentTime = howlRef.current.seek() as number;
      setState((prev) => ({ ...prev, currentTime }));
      onTimeUpdateRef.current?.(currentTime);

      // Handle AB loop
      const loop = abLoopRef.current;
      if (loop.enabled && loop.pointA !== null && loop.pointB !== null) {
        if (currentTime >= loop.pointB) {
          howlRef.current.seek(loop.pointA);
        }
      }

      if (howlRef.current.playing()) {
        rafRef.current = requestAnimationFrame(updateTime);
      }
    };

    const howl = new Howl({
      src: [src],
      html5: true,
      rate: initialSpeed,
      onload: () => {
        setState((prev) => ({
          ...prev,
          duration: howl.duration(),
          isLoading: false,
        }));
      },
      onplay: () => {
        setState((prev) => ({ ...prev, isPlaying: true }));
        rafRef.current = requestAnimationFrame(updateTime);
      },
      onpause: () => {
        setState((prev) => ({ ...prev, isPlaying: false }));
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onstop: () => {
        setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      },
      onend: () => {
        setState((prev) => ({ ...prev, isPlaying: false }));
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onEndRef.current?.();
      },
      onloaderror: () => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to load audio",
        }));
      },
    });

    howlRef.current = howl;

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      howl.unload();
    };
  }, [src]);

  const play = useCallback(() => {
    howlRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (howlRef.current?.playing()) {
      howlRef.current.pause();
    } else {
      howlRef.current?.play();
    }
  }, []);

  const seek = useCallback((time: number) => {
    howlRef.current?.seek(time);
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    howlRef.current?.volume(volume);
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    howlRef.current?.rate(speed);
    setState((prev) => ({ ...prev, speed }));
    localStorage.setItem(SPEED_KEY, String(speed));
  }, []);

  const setPointA = useCallback(() => {
    setState((prev) => {
      setABLoop((loop) => ({
        ...loop,
        pointA: prev.currentTime,
        enabled: loop.pointB !== null,
      }));
      return prev;
    });
  }, []);

  const setPointB = useCallback(() => {
    setABLoop((prev) => {
      if (prev.pointA === null) return prev;
      const currentTime = howlRef.current?.seek() as number;
      return {
        ...prev,
        pointB: currentTime,
        enabled: true,
      };
    });
  }, []);

  const clearABLoop = useCallback(() => {
    setABLoop({ enabled: false, pointA: null, pointB: null });
  }, []);

  return {
    ...state,
    abLoop,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setSpeed,
    setPointA,
    setPointB,
    clearABLoop,
  };
}
