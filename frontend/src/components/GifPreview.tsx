import { useState, useEffect, useRef } from "react";
import { Play, PauseIcon, Volume2, VolumeX, ArrowUp, ArrowDown, AlignCenter } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template } from "@/services/templateService";
import type { Background } from "@/services/backgroundService";

interface Sound {
  id: number;
  name: string;
  sound_link: string;
}

interface GifPreviewProps {
  hook: string;
  selectedGif: number | null;
  selectedTemplate?: Template;
  selectedBackground?: Background | null;
  selectedSound?: Sound | null;
  onTextPositionChange?: (position: "top" | "center" | "bottom") => void;
}

type TextPosition = "top" | "center" | "bottom";

const GifPreview = ({ 
  hook, 
  selectedGif, 
  selectedTemplate, 
  selectedBackground,
  selectedSound, 
  onTextPositionChange
}: GifPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gifVideoLoaded, setGifVideoLoaded] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [textPosition, setTextPosition] = useState<TextPosition>("bottom");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = setTimeout(() => {
        console.log("Loading timeout reached, forcing completion");
        setLoadingTimeout(true);
        setGifVideoLoaded(true);
        setBackgroundLoaded(true);
        setIsLoading(false);
      }, 3000);
    } else if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    setGifVideoLoaded(false);
    setBackgroundLoaded(false);
    setIsLoading(true);
    setLoadingTimeout(false);
    
    if (!selectedTemplate && selectedGif === null) {
      setIsLoading(false);
    }
  }, [selectedGif, selectedTemplate, selectedBackground]);

  useEffect(() => {
    // Start playback when both video and background are loaded
    if (gifVideoLoaded && (backgroundLoaded || !selectedBackground)) {
      setIsLoading(false);
      if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
      if (audioRef.current) {
        if (isPlaying && !isMuted) {
          audioRef.current.play().catch(error => {
            console.error('Error playing audio:', error);
          });
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [gifVideoLoaded, backgroundLoaded, isPlaying, isMuted, selectedBackground]);

  useEffect(() => {
    // Handle audio playback when isPlaying or isMuted changes
    if (audioRef.current) {
      if (isPlaying && !isMuted) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
    
    // Handle video playback when isPlaying changes
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error('Error playing video:', error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isMuted]);

  // Handle text position changes
  const handleTextPositionChange = (position: TextPosition) => {
    setTextPosition(position);
    if (onTextPositionChange) {
      onTextPositionChange(position);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleBackgroundLoad = () => {
    setBackgroundLoaded(true);
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black/80">
      <div className="aspect-[9/16] relative overflow-hidden">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20">
            <div className="text-center space-y-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-xs text-primary-foreground">Loading preview...</p>
            </div>
          </div>
        )}
        
        {/* Background image */}
        {selectedBackground && (
          <div className="absolute inset-0 z-10">
            <img 
              src={selectedBackground.image_link} 
              alt="Background" 
              className="w-full h-full object-cover"
              onLoad={handleBackgroundLoad}
            />
          </div>
        )}
        
        {/* Gif video */}
        {selectedTemplate && (
          <video
            ref={videoRef}
            src={selectedTemplate.video_link}
            className="absolute inset-0 z-20 w-full h-full object-contain"
            playsInline
            loop
            autoPlay={isPlaying}
            muted={isMuted}
            onLoadedData={() => setGifVideoLoaded(true)}
          />
        )}
        
        {/* Placeholder when no template is selected */}
        {!selectedTemplate && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/20">
            <p className="text-sm text-muted-foreground">Select a GIF template to preview</p>
          </div>
        )}
        
        {/* Caption/Hook text */}
        {hook && (
          <div 
            className={cn(
              "absolute z-30 left-0 right-0 px-4 py-3 text-center text-white font-bold text-xl drop-shadow-lg",
              textPosition === "top" && "top-4",
              textPosition === "center" && "top-1/2 transform -translate-y-1/2",
              textPosition === "bottom" && "bottom-4"
            )}
          >
            {hook}
          </div>
        )}
        
        {/* Audio (hidden) */}
        {selectedSound && (
          <audio
            ref={audioRef}
            src={selectedSound.sound_link}
            loop
            autoPlay={isPlaying && !isMuted}
            muted={isMuted}
          />
        )}
        
        {/* Controls overlay */}
        <div className="absolute z-40 bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <button 
              onClick={togglePlayback} 
              className="text-white p-1 rounded-full bg-black/30 hover:bg-black/50"
            >
              {isPlaying ? <PauseIcon size={16} /> : <Play size={16} />}
            </button>
            
            <button 
              onClick={toggleMute} 
              className="text-white p-1 rounded-full bg-black/30 hover:bg-black/50"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Text position controls */}
      <div className="p-3 bg-muted/10 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Text Position</span>
          <ToggleGroup type="single" value={textPosition} onValueChange={(value) => handleTextPositionChange(value as TextPosition)}>
            <ToggleGroupItem value="top" size="sm" className="p-1">
              <ArrowUp className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" size="sm" className="p-1">
              <AlignCenter className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="bottom" size="sm" className="p-1">
              <ArrowDown className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
};

export default GifPreview;
