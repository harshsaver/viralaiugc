import { useState, useEffect, useRef } from "react";
import { Play, PauseIcon, Volume2, VolumeX, ArrowUp, ArrowDown, AlignCenter, PlayCircle, PauseCircle, Move, MoveVertical, MoveHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { Template } from "@/services/templateService";
import type { Background } from "@/services/backgroundService";
import { Button } from "@/components/ui/button";

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
  const loadingTimeoutRef = useRef<number | null>(null);

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
      console.log("Starting video playback after loading");
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
    console.log("Background loaded");
    setBackgroundLoaded(true);
  };

  const handleVideoLoad = () => {
    console.log("Video loaded");
    setGifVideoLoaded(true);
  };

  // Get text position styles
  const getTextPositionStyle = () => {
    switch(textPosition) {
      case 'top':
        return 'top-8';
      case 'center':
        return 'top-1/2 -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-8';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto" style={{ width: '270px', height: '480px' }}>
        <div className="absolute inset-0 bg-black rounded-lg overflow-hidden">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/20">
              <div className="text-center space-y-2">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-xs text-primary-foreground">Loading preview...</p>
              </div>
            </div>
          )}
          
          {/* Background layer */}
          {selectedBackground ? (
            <img
              src={selectedBackground.image_link}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={handleBackgroundLoad}
              alt="Background"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}
          
          {/* Video layer with mix-blend-mode for simple compositing */}
          {selectedTemplate && (
            <video
              ref={videoRef}
              src={selectedTemplate.video_link}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ mixBlendMode: 'screen' }}
              loop
              muted
              playsInline
              onLoadedData={handleVideoLoad}
              crossOrigin="anonymous"
            />
          )}
          
          {/* No content placeholder */}
          {!selectedTemplate && selectedGif === null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Select a GIF template to preview</p>
            </div>
          )}
          
          {/* Text overlay */}
          {hook && (
            <div className={`absolute left-0 right-0 px-4 text-center z-10 ${getTextPositionStyle()}`}>
              <h1 className="text-2xl font-bold text-white leading-tight"
                style={{
                  textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 0 -2px 0 #000, 0 2px 0 #000, -2px 0 0 #000, 2px 0 0 #000'
                }}
              >
                {hook}
              </h1>
            </div>
          )}
          
          {/* Audio element */}
          {selectedSound && (
            <audio
              ref={audioRef}
              src={selectedSound.sound_link}
              loop
              muted={isMuted}
            />
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="space-y-3">
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={togglePlayback}
            className="gap-2"
          >
            {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMute}
            className="gap-2"
            disabled={!selectedSound}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
        </div>
        
        {/* Text position controls */}
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            variant={textPosition === 'top' ? 'default' : 'outline'}
            onClick={() => handleTextPositionChange('top')}
            className="gap-2"
          >
            <MoveVertical className="h-4 w-4" />
            Top
          </Button>
          <Button
            size="sm"
            variant={textPosition === 'center' ? 'default' : 'outline'}
            onClick={() => handleTextPositionChange('center')}
            className="gap-2"
          >
            <Move className="h-4 w-4" />
            Center
          </Button>
          <Button
            size="sm"
            variant={textPosition === 'bottom' ? 'default' : 'outline'}
            onClick={() => handleTextPositionChange('bottom')}
            className="gap-2"
          >
            <MoveHorizontal className="h-4 w-4" />
            Bottom
          </Button>
        </div>
        
        {/* Preview notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Preview only - Final render will include green screen removal
          </p>
        </div>
      </div>
    </div>
  );
};

export default GifPreview;
