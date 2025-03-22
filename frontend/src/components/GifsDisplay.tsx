import { useState, useEffect } from "react";
import { Sparkles, Wand2, Music, CreditCard, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import HookInput from "./HookInput";
import AvatarGrid from "./AvatarGrid";
import GifPreview from "./GifPreview";
import AudioSelector from "./AudioSelector";
import AuthDialog from "./AuthDialog";
import BackgroundGrid from "./BackgroundGrid";
import BackgroundUploadDialog from "./BackgroundUploadDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
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
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<number | null>(null);
  const [selectedBackgroundData, setSelectedBackgroundData] = useState<Background | null>(null);
  const [backgroundUploadOpen, setBackgroundUploadOpen] = useState(false);
  const [videoSavedDialogOpen, setVideoSavedDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();
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
    if (!user) {
      toast.error("You must be logged in to generate videos");
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a gif template");
      return;
    }

    try {
      const remotionData = {
        user_id: user.id,
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
          user_id: user.id,
          video_type: 'gif', // Using gif as the video type
          text_alignment: textPosition,
          sound_id: selectedSound ? selectedSound.id : null,
          template_id: selectedTemplate ? Number(selectedTemplate.id) : null,
          background_id: selectedBackground,
          remotion: remotionData,
          caption: hook,
          status: 'pending' // Default status
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Video saved successfully!");
      setVideoSavedDialogOpen(true);

      // Deduct a credit for free users
      if (profile && profile.plan === 'free' && profile.credits && profile.credits > 0) {
        const newCredits = profile.credits - 1;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: newCredits })
          .eq('id', profile.id);
          
        if (updateError) {
          console.error('Error updating credits:', updateError);
        }
      }
    } catch (error: any) {
      console.error('Error saving generated video:', error);
      toast.error(error.message || 'Failed to save generated video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    if (!hook) {
      toast.error("Please enter a hook first");
      return;
    }
    
    if (selectedGif === null) {
      toast.error("Please select a gif template");
      return;
    }
    
    if (profile && profile.plan === 'free' && (profile.credits <= 0)) {
      setUpgradeDialogOpen(true);
      return;
    }
    
    setIsGenerating(true);
    saveGeneratedVideo();
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleOpenAudioSelector = () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
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
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    setBackgroundUploadOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Gifs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Hook Input */}
          <HookInput 
            value={hook} 
            onChange={setHook} 
            step={1} 
            totalSteps={totalSteps} 
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
            
            {/* Background upload button removed as requested */}
            
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
          
          {/* Credits info for free users */}
          {profile && profile.plan === 'free' && (
            <Card className="border p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-full">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Credits: {profile.credits || 0}</p>
                  <p className="text-xs text-muted-foreground">1 credit = 1 video</p>
                </div>
              </div>
            </Card>
          )}
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
      
      {/* Auth Dialog */}
      <AuthDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
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
      
      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Out of credits</DialogTitle>
            <DialogDescription>
              You've used all your free credits. Upgrade to a paid plan to create unlimited videos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => navigate('/settings')}>
              Upgrade Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GifsDisplay;
