import { useState, useEffect } from "react";
import { Sparkles, Wand2, Music, CreditCard, ExternalLink, Twitter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HookInput from "./HookInput";
import AvatarGrid from "./AvatarGrid";
import ContentPreview from "./ContentPreview";
import AudioSelector from "./AudioSelector";
import AuthDialog from "./AuthDialog";
import DemoGrid from "./DemoGrid";
import DemoUploader from "./DemoUploader";
import ProductSelector from "./ProductSelector";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { Template } from "@/services/templateService";
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

interface Demo {
  id: number;
  demo_link: string;
}

const ContentGenerator = () => {
  const [hook, setHook] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSelectorOpen, setAudioSelectorOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [isUploadingDemo, setIsUploadingDemo] = useState(false);
  const [selectedDemoLink, setSelectedDemoLink] = useState<string | null>(null);
  const [videoSavedDialogOpen, setVideoSavedDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [videoLayout, setVideoLayout] = useState<"serial" | "side" | "top">("serial");
  const [selectedDemoType, setSelectedDemoType] = useState<DemoType | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const [savedDemoId, setSavedDemoId] = useState<number | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<"side" | "top" | "serial">("side");
  const [customSoundFile, setCustomSoundFile] = useState<File | null>(null);
  const [customSoundUrl, setCustomSoundUrl] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const totalSteps = selectedDemoType !== "none" ? 5 : 4;

  useEffect(() => {
    const fetchDemoLink = async () => {
      if (selectedDemo !== null) {
        try {
          const { data, error } = await supabase
            .from('demo')
            .select('demo_link')
            .eq('id', selectedDemo)
            .single();
          
          if (error) {
            throw error;
          }
          
          setSelectedDemoLink(data.demo_link);
        } catch (error) {
          console.error('Error fetching demo link:', error);
          toast.error('Failed to load demo');
          setSelectedDemoLink(null);
        }
      } else {
        setSelectedDemoLink(null);
      }
    };
    
    fetchDemoLink();
  }, [selectedDemo]);

  const handleLayoutChange = (layout: "serial" | "side" | "top") => {
    setVideoLayout(layout);
  };

  const handleTextPositionChange = (position: "top" | "center" | "bottom") => {
    setTextPosition(position);
  };

  const saveGeneratedVideo = async () => {
    if (!selectedTemplate) {
      toast.error("Please select an AI avatar template");
      return;
    }

    try {
      const remotionData = {
        user_id: null, // No user auth needed
        text_alignment: textPosition,
        video_alignment: selectedDemoType !== "none" ? selectedLayout : null,
        sound: selectedSound ? selectedSound.sound_link : customSoundUrl,
        demo: demoUrl,
        template: selectedTemplate.video_link,
        videotype: "aiugc",
        caption: hook
      };

      const { data, error } = await supabase
        .from('generated_videos')
        .insert({
          user_id: crypto.randomUUID(), // Generate a random UUID for tracking
          video_type: 'aiugc',
          text_alignment: textPosition,
          video_alignment: selectedDemoType !== "none" ? selectedLayout : null,
          sound_id: selectedSound ? selectedSound.id : null,
          demo_id: savedDemoId,
          template_id: selectedTemplate ? Number(selectedTemplate.id) : null,
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
    
    if (selectedAvatar === null) {
      toast.error("Please select an AI avatar template");
      return;
    }

    if (selectedDemoType !== "none" && !demoUrl) {
      toast.error("Please upload or select a video first");
      return;
    }
    
    setIsGenerating(true);
    saveGeneratedVideo();
  };

  const handleAudioUpload = async (file: File) => {
    try {
      const fileName = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
      const filePath = `user-uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sound')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('sound')
        .getPublicUrl(filePath);

      setCustomSoundFile(file);
      setCustomSoundUrl(publicUrlData.publicUrl);
      setSelectedSound(null);
      
      toast.success("Custom audio uploaded successfully!");
    } catch (error: any) {
      console.error('Error uploading audio:', error);
      toast.error(error.message || 'Failed to upload audio');
    }
  };

  const handleOpenAudioSelector = () => {
    setAudioSelectorOpen(true);
  };

  const handleSelectSound = (sound: Sound | null) => {
    setSelectedSound(sound);
    setCustomSoundFile(null);
    setCustomSoundUrl(null);
    if (sound) {
      toast.success(`Selected audio: ${sound.name}`);
    } else {
      toast.success("Audio has been reset");
    }
  };

  const handleSelectDemoType = (type: DemoType) => {
    setSelectedDemoType(type);
    if (type === "none") {
      setDemoFile(null);
      setDemoUrl(null);
      setSavedDemoId(null);
    }
  };

  const handleOpenDemoUploader = () => {
    setDemoUploaderOpen(true);
  };

  const handleDemoUploaded = (url: string, demoId: number) => {
    setDemoUrl(url);
    setSavedDemoId(demoId);
    setDemoFile(null);
    setDemoUploaderOpen(false);
    toast.success("Demo video uploaded successfully!");
  };

  const handleGoToVideos = () => {
    setVideoSavedDialogOpen(false);
    navigate('/dashboard?tab=videos');
  };

  const handleSelfHostRedirect = () => {
    navigate('/self-host');
    setUpgradeDialogOpen(false);
  };

  const handleTwitterDM = () => {
    window.open('https://x.com/rushabtated4', '_blank');
    setUpgradeDialogOpen(false);
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-6">Create UGC Ads</h1>
          
          <div className="space-y-8">
            <ProductSelector
              selectedProductId={selectedProduct?.id || null}
              onSelectProduct={setSelectedProduct}
            />
            
            <HookInput 
              value={hook} 
              onChange={setHook} 
              step={1} 
              totalSteps={totalSteps}
              selectedProduct={selectedProduct}
            />
            
            <AvatarGrid 
              step={2} 
              totalSteps={totalSteps} 
              selectedAvatar={selectedAvatar} 
              onSelectAvatar={setSelectedAvatar}
              onSelectTemplate={handleSelectTemplate}
            />
            
            <DemoGrid
              step={3}
              totalSteps={totalSteps}
              selectedDemo={selectedDemo}
              onSelectDemo={handleSelectDemo}
              onAddDemo={handleAddDemo}
            />
          </div>
        </div>
      </div>
      
      <div className="w-96 border-l border-border">
        <div className="sticky top-0 p-4 h-screen flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Preview</h2>
            <p className="text-xs text-muted-foreground">
              {selectedDemo && selectedAvatar !== null 
                ? "Use the layout controls to customize video display"
                : "Select an avatar and demo to customize layout"}
            </p>
          </div>
          
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
            <ContentPreview 
              hook={hook} 
              avatarId={selectedAvatar} 
              selectedTemplate={selectedTemplate}
              selectedSound={selectedSound}
              demoVideoUrl={selectedDemoLink}
              onLayoutChange={handleLayoutChange}
              onTextPositionChange={handleTextPositionChange}
            />
          </div>
          
          <div className="mt-4 space-y-3">
            {profile && profile.plan === 'free' && (
              <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Available Credits</span>
                </div>
                <span className="text-sm font-bold">{profile.credits || 0}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleOpenAudioSelector}
            >
              <Music className="mr-2 h-4 w-4" />
              {selectedSound ? selectedSound.name : "Select Audio"}
            </Button>
            {!selectedSound && (
              <div className="mb-2 text-xs text-center text-muted-foreground">
                Choose audio for your UGC
              </div>
            )}
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate UGC
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
            <DialogDescription>
              Upgrade to generate unlimited AI UGC videos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col h-full p-6 hover:border-primary transition-colors">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Monthly</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-sm text-muted-foreground ml-1">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground flex-grow mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited AI UGC videos
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    All features included
                  </li>
                </ul>
                <Button onClick={handleTwitterDM} className="mt-auto w-full py-5">
                  <Twitter className="mr-2 h-4 w-4" />
                  DM for Access
                </Button>
              </Card>
              
              <Card className="flex flex-col h-full p-6 bg-primary/5 border-primary relative">
                <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                  Best Value
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Yearly</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold">$199</span>
                    <span className="text-sm text-muted-foreground ml-1">/year</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground flex-grow mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Unlimited AI UGC videos
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    All features included
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Save 17% vs monthly
                  </li>
                </ul>
                <Button onClick={handleTwitterDM} className="mt-auto w-full py-5">
                  <Twitter className="mr-2 h-4 w-4" />
                  DM for Access
                </Button>
              </Card>
              
              <Card className="flex flex-col h-full p-6 hover:border-primary transition-colors">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Self-Hosted</h3>
                  <div className="mt-2 flex items-baseline">
                    <span className="text-4xl font-bold">Free</span>
                    <span className="text-sm text-muted-foreground ml-1">deploy yourself</span>
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground flex-grow mb-6">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Full privacy & control
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Installation instructions
                  </li>
                </ul>
                <Button variant="outline" onClick={handleSelfHostRedirect} className="mt-auto w-full py-5 group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setUpgradeDialogOpen(false)}
              className="sm:w-auto w-full"
            >
              Maybe Later
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isUploadingDemo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md">
            <DemoUploader
              onSuccess={handleDemoUploaded}
              onCancel={() => setIsUploadingDemo(false)}
            />
          </div>
        </div>
      )}
      
      <AudioSelector 
        isOpen={audioSelectorOpen}
        onClose={() => setAudioSelectorOpen(false)}
        onSelect={handleSelectSound}
      />
      
      <AuthDialog 
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
      />

      <Dialog open={videoSavedDialogOpen} onOpenChange={setVideoSavedDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Video Generated Successfully</DialogTitle>
            <DialogDescription>
              Your UGC video has been generated and will be available in the Videos section.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleGoToVideos}>
              Go to Videos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentGenerator;
