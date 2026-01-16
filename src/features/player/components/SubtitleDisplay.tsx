"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SubtitleData, SubtitleItem } from "@/types";

interface SubtitleDisplayProps {
  subtitleData: SubtitleData | null;
  currentTime: number;
  onSeek: (time: number) => void;
  className?: string;
}

const FONT_SIZES = [14, 16, 18, 20, 24];
const FONT_SIZE_KEY = "subtitle_font_size";

export function SubtitleDisplay({
  subtitleData,
  currentTime,
  onSeek,
  className,
}: SubtitleDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    return saved ? parseInt(saved, 10) : 16;
  });

  const currentIndex =
    subtitleData?.subtitles.findIndex((sub) => currentTime >= sub.start && currentTime < sub.end) ??
    -1;

  // Auto-scroll to current subtitle
  useEffect(() => {
    if (currentIndex >= 0 && containerRef.current) {
      const activeElement = containerRef.current.querySelector("[data-active='true']");
      activeElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  const adjustFontSize = (delta: number) => {
    const currentIdx = FONT_SIZES.indexOf(fontSize);
    const newIdx = Math.max(0, Math.min(FONT_SIZES.length - 1, currentIdx + delta));
    const newSize = FONT_SIZES[newIdx];
    setFontSize(newSize);
    localStorage.setItem(FONT_SIZE_KEY, String(newSize));
  };

  if (!subtitleData || subtitleData.subtitles.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        No subtitles available
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Font size controls */}
      <div className="flex items-center justify-end gap-1 p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjustFontSize(-1)}
          disabled={fontSize === FONT_SIZES[0]}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-8 text-center">{fontSize}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => adjustFontSize(1)}
          disabled={fontSize === FONT_SIZES[FONT_SIZES.length - 1]}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtitle list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: "300px" }}
      >
        {subtitleData.subtitles.map((subtitle, index) => (
          <SubtitleLine
            key={index}
            subtitle={subtitle}
            isActive={index === currentIndex}
            fontSize={fontSize}
            onClick={() => onSeek(subtitle.start)}
          />
        ))}
      </div>
    </div>
  );
}

interface SubtitleLineProps {
  subtitle: SubtitleItem;
  isActive: boolean;
  fontSize: number;
  onClick: () => void;
}

function SubtitleLine({ subtitle, isActive, fontSize, onClick }: SubtitleLineProps) {
  return (
    <div
      data-active={isActive}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md p-2 transition-colors hover:bg-accent",
        isActive && "bg-primary/10 border-l-2 border-primary"
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <p className={cn("leading-relaxed", isActive && "text-primary font-medium")}>{subtitle.en}</p>
      {subtitle.zh && (
        <p className="text-muted-foreground mt-1" style={{ fontSize: `${fontSize - 2}px` }}>
          {subtitle.zh}
        </p>
      )}
    </div>
  );
}
