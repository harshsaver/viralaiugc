import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { SlideData, AspectRatio } from "./types";

interface SlideManagerProps {
  slides: SlideData[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  aspectRatio?: AspectRatio;
}

const SlideManager = ({
  slides,
  currentSlideIndex,
  setCurrentSlideIndex,
  addSlide,
  deleteSlide,
  aspectRatio = "9:16"
}: SlideManagerProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Slides</h2>
        <Button onClick={addSlide} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Slide
        </Button>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`
              p-3 rounded-md cursor-pointer flex justify-between items-center
              ${index === currentSlideIndex ? 'bg-primary/10 border border-primary/30' : 'bg-muted hover:bg-muted/80'}
            `}
            onClick={() => setCurrentSlideIndex(index)}
          >
            <div className="flex items-center">
              <div 
                className={`${
                  aspectRatio === "16:9" ? "w-20 h-12" :
                  aspectRatio === "1:1" ? "w-16 h-16" :
                  aspectRatio === "4:5" ? "w-16 h-20" :
                  "w-12 h-20"
                } rounded overflow-hidden mr-3 shrink-0 border`}
                style={{ 
                  backgroundColor: slide.backgroundType === "color" ? slide.backgroundColor : undefined,
                  backgroundImage: slide.backgroundType === "image" ? `url(${slide.backgroundImage})` : undefined,
                  backgroundSize: "cover"
                }}
              >
                {slide.backgroundType.startsWith("grid") && slide.gridImages && (
                  <div className={`grid h-full ${
                    slide.backgroundType === "grid" ? "grid-cols-2 grid-rows-2" :
                    slide.backgroundType === "grid-2x1" ? "grid-cols-2 grid-rows-1" :
                    slide.backgroundType === "grid-1x2" ? "grid-cols-1 grid-rows-2" :
                    slide.backgroundType === "grid-3x3" ? "grid-cols-3 grid-rows-3" : ""
                  }`}>
                    {Array.from({ length: 
                      slide.backgroundType === "grid" ? 4 :
                      slide.backgroundType === "grid-2x1" ? 2 :
                      slide.backgroundType === "grid-1x2" ? 2 :
                      slide.backgroundType === "grid-3x3" ? 9 : 4
                    }).map((_, i) => (
                      <div key={i} className="bg-gray-100 relative">
                        {slide.gridImages?.[i] && (
                          <img
                            src={slide.gridImages[i]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">Slide {index + 1}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {slide.backgroundType} background
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteSlide(index);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideManager;
