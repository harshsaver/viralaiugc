import { useState, useEffect } from "react";
import { Sparkles, Wand2, Music, CreditCard, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import HookInput from "./HookInput";
import AvatarGrid from "./AvatarGrid";
import GifPreview from "./GifPreview";
import AudioSelector from "./AudioSelector";
import BackgroundGrid from "./BackgroundGrid";
import BackgroundUploadDialog from "./BackgroundUploadDialog";
import ProductSelector from "./ProductSelector";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { Template } from "@/services/templateService";
import type { Background } from "@/services/backgroundService";
import { fetchBackgroundById } from "@/services/backgroundService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface Sound {
  id: number;
  name: string;
  sound_link: string;
}

const GifsDisplay = () => {
  const [hook, setHook] = useState("");
  const [selectedGif, setSelectedGif] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSelectorOpen, setAudioSelectorOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<number | null>(null);
  const [selectedBackgroundData, setSelectedBackgroundData] = useState<Background | null>(null);
  const [backgroundUploadOpen, setBackgroundUploadOpen] = useState(false);
  const [videoSavedDialogOpen, setVideoSavedDialogOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const navigate = useNavigate();
  const totalSteps = 3;

  // Use the 'gif' template_type that exists in Supabase
  const actualTemplateType = "gif";
  
  // Fetch background data when selectedBackground changes
  useEffect(() => {
    const fetchBackgroundData = async () => {
      if (selectedBackground !== null) {
        try {
          const data = await fetchBackgroundById(selectedBackground);
          setSelectedBackgroundData(data);
        } catch (error) {
          console.error('Error fetching background data:', error);
          toast.error('Failed to load background');
          setSelectedBackgroundData(null);
        }
      } else {
        setSelectedBackgroundData(null);
      }
    };
    
    fetchBackgroundData();
  }, [selectedBackground]);

  // Listen for background upload events
  useEffect(() => {
    const handleBackgroundUploaded = () => {
      toast.success("Background updated. Refreshing...");
    };
    
    window.addEventListener('backgroundUploaded', handleBackgroundUploaded);
    
    return () => {
      window.removeEventListener('backgroundUploaded', handleBackgroundUploaded);
    };
  }, []);

  const handleTextPositionChange = (position: "top" | "center" | "bottom") => {
    setTextPosition(position);
  };

  const saveGeneratedVideo = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a gif template");
      return;
    }

    try {
      const remotionData = {
        user_id: null, // No user auth needed
        text_alignment: textPosition,
        sound: selectedSound ? selectedSound.sound_link : null,
        background: selectedBackgroundData ? selectedBackgroundData.image_link : null,
        template: selectedTemplate.video_link,
        videotype: "gif",
        caption: hook
      };

      const { data, error } = await supabase
        .from('generated_videos')
        .insert({
          user_id: crypto.randomUUID(), // Generate a random UUID for tracking
          video_type: 'gif', // Using 'gif' as the video type
          text_alignment: textPosition,
          sound_id: selectedSound ? selectedSound.id : null,
          template_id: selectedTemplate ? Number(selectedTemplate.id) : null,
          background_id: selectedBackground,
          remotion: remotionData,
          caption: hook,
          status: 'pending'
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Video saved successfully!");
      setVideoSavedDialogOpen(true);
    } catch (error: any) {
      console.error('Error saving generated video:', error);
      toast.error(error.message || 'Failed to save generated video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (!hook) {
      toast.error("Please enter a hook first");
      return;
    }
    
    if (selectedGif === null) {
      toast.error("Please select a gif template");
      return;
    }
    
    setIsGenerating(true);
    saveGeneratedVideo();
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleOpenAudioSelector = () => {
    setAudioSelectorOpen(true);
  };

  const handleSelectSound = (sound: Sound | null) => {
    setSelectedSound(sound);
    if (sound) {
      toast.success(`Selected audio: ${sound.name}`);
    } else {
      toast.success("Audio has been reset");
    }
  };

  const handleSelectBackground = (backgroundId: number | null) => {
    setSelectedBackground(backgroundId);
  };

  const handleOpenBackgroundUpload = () => {
    setBackgroundUploadOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gifs</h1>
      
      {/* Product Selector */}
      <ProductSelector
        selectedProductId={selectedProduct?.id || null}
        onSelectProduct={setSelectedProduct}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Hook Input */}
          <HookInput 
            value={hook} 
            onChange={setHook} 
            step={1} 
            totalSteps={totalSteps}
            selectedProduct={selectedProduct}
          />
          
          {/* Gif Templates */}
          <AvatarGrid 
            step={2} 
            totalSteps={totalSteps} 
            selectedAvatar={selectedGif}
            onSelectAvatar={setSelectedGif}
            onSelectTemplate={handleSelectTemplate}
            templateType={actualTemplateType}
          />
          
          {/* Backgrounds Grid */}
          <BackgroundGrid
            step={3}
            totalSteps={totalSteps}
            selectedBackground={selectedBackground}
            onSelectBackground={handleSelectBackground}
            onAddBackground={handleOpenBackgroundUpload}
          />
        </div>
        
        <div className="space-y-6">
          {/* Preview */}
          <Card className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">Preview</h3>
            </div>
            <div className="p-4">
              <GifPreview
                hook={hook}
                selectedGif={selectedGif}
                selectedTemplate={selectedTemplate}
                selectedBackground={selectedBackgroundData}
                selectedSound={selectedSound}
                onTextPositionChange={handleTextPositionChange}
              />
            </div>
          </Card>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start font-normal" 
              onClick={handleOpenAudioSelector}
            >
              <Music className="h-4 w-4 mr-2" />
              Select Audio
            </Button>
            
            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Audio Selector Dialog */}
      <AudioSelector
        isOpen={audioSelectorOpen}
        onClose={() => setAudioSelectorOpen(false)}
        onSelect={handleSelectSound}
      />
      
      {/* Background Upload Dialog */}
      <BackgroundUploadDialog
        isOpen={backgroundUploadOpen}
        onClose={() => setBackgroundUploadOpen(false)}
      />
      
      {/* Video Saved Dialog */}
      <Dialog open={videoSavedDialogOpen} onOpenChange={setVideoSavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Video Saved Successfully!</DialogTitle>
            <DialogDescription>
              Your video has been queued for processing. You'll be able to view and download it once it's ready.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => navigate('/dashboard?tab=videos')}>
              View My Videos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GifsDisplay;
