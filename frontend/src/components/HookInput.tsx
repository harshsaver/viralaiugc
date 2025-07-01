import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { generateHooks } from "@/services/openaiService";
import { toast } from "sonner";

interface HookInputProps {
  value: string;
  onChange: (value: string) => void;
  step: number;
  totalSteps: number;
  selectedProduct?: any;
}

const HookInput = ({ value, onChange, step, totalSteps, selectedProduct }: HookInputProps) => {
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const [currentHookIndex, setCurrentHookIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle hook selection from AI hooks
  useEffect(() => {
    if (aiHooks.length > 0 && currentHookIndex < aiHooks.length) {
      onChange(aiHooks[currentHookIndex]);
    }
  }, [currentHookIndex, aiHooks]);

  const handleGenerateHooks = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    setIsGenerating(true);
    try {
      const newHooks = await generateHooks(selectedProduct, 10);
      setAiHooks(prevHooks => [...prevHooks, ...newHooks]);
      setCurrentHookIndex(aiHooks.length); // Jump to first new hook
      toast.success(`Generated ${newHooks.length} new hooks!`);
    } catch (error: any) {
      console.error('Error generating hooks:', error);
      if (error.message.includes('API key')) {
        toast.error('OpenAI API key not configured. Please check environment variables.');
      } else {
        toast.error(error.message || 'Failed to generate hooks');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviousHook = () => {
    if (currentHookIndex > 0) {
      setCurrentHookIndex(currentHookIndex - 1);
    }
  };

  const handleNextHook = async () => {
    if (currentHookIndex < aiHooks.length - 1) {
      setCurrentHookIndex(currentHookIndex + 1);
    } else if (currentHookIndex === aiHooks.length - 1 && selectedProduct) {
      // Auto-generate more hooks when reaching the end
      await handleGenerateHooks();
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">{step}. Hook</h3>
        <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
      </div>
      
      <div className="space-y-3">
        <Textarea
          placeholder="Enter your hook (e.g., 'POV: You just discovered the secret to...')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        
        {selectedProduct && (
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateHooks}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  Generating AI Hooks...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Hooks
                </>
              )}
            </Button>
            
            {aiHooks.length > 0 && (
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    AI Hook {currentHookIndex + 1} of {aiHooks.length}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePreviousHook}
                      disabled={currentHookIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleNextHook}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">
                  {currentHookIndex === aiHooks.length - 1 && 
                    <span className="text-xs text-muted-foreground block mb-1">
                      (Click next to generate more)
                    </span>
                  }
                </p>
              </Card>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Keep it short and engaging. This will overlay on your video.
        </p>
      </div>
    </div>
  );
};

export default HookInput;
