import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Image, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { fetchBackgrounds, Background } from "@/services/backgroundService";

interface BackgroundGridProps {
  selectedBackground: number | null;
  onSelectBackground: (backgroundId: number | null) => void;
  onAddBackground?: () => void;
  step: number;
  totalSteps: number;
}

const BackgroundGrid = ({ 
  selectedBackground, 
  onSelectBackground, 
  onAddBackground, 
  step, 
  totalSteps 
}: BackgroundGridProps) => {
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        setLoading(true);
        const data = await fetchBackgrounds();
        setBackgrounds(data);
      } catch (error) {
        console.error('Error fetching backgrounds:', error);
        toast.error('Failed to load backgrounds');
      } finally {
        setLoading(false);
      }
    };

    loadBackgrounds();
  }, []);

  const handleResetBackground = () => {
    onSelectBackground(null);
    toast.success('Background selection reset');
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">3. Backgrounds</h3>
        <div className="flex items-center gap-2">
          {selectedBackground !== null && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetBackground}
              className="text-xs h-7 px-2"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{step}/{totalSteps}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {onAddBackground && (
          <div 
            className="aspect-square rounded-lg border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/50 smooth-transition"
            onClick={onAddBackground}
          >
            <div className="flex flex-col items-center text-muted-foreground">
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Add</span>
            </div>
          </div>
        )}
        
        {backgrounds.map((background) => (
          <div 
            key={background.id}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${selectedBackground === background.id ? 'border-primary' : 'border-transparent'} hover:opacity-90 transition-opacity`}
            onClick={() => onSelectBackground(background.id)}
          >
            <img 
              src={background.thumbnail || background.image_link} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <span className="text-sm text-muted-foreground">Loading backgrounds...</span>
        </div>
      )}
      
      {!loading && backgrounds.length === 0 && (
        <div className="text-center py-4">
          <span className="text-sm text-muted-foreground">No backgrounds found</span>
        </div>
      )}
    </div>
  );
};

export default BackgroundGrid;
