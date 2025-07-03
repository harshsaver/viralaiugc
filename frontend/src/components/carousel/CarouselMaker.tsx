import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarouselEditor from "@/components/carousel/CarouselEditor";
import CarouselPreview from "@/components/carousel/CarouselPreview";
import SlideManager from "@/components/carousel/SlideManager";
import ProductSelector from "@/components/ProductSelector";
import { SlideData, AspectRatio, AspectRatioConfig } from "./types";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DEFAULT_SLIDE: SlideData = {
  id: uuidv4(),
  backgroundType: "color",
  backgroundColor: "#ffffff",
  backgroundImage: "",
  textElements: [],
  stickerElements: []
};

const ASPECT_RATIOS: AspectRatioConfig[] = [
  {
    label: "Stories/Reels (9:16)",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    description: "TikTok, Instagram Stories, YouTube Shorts"
  },
  {
    label: "Square (1:1)",
    ratio: "1:1",
    width: 1080,
    height: 1080,
    description: "Instagram Posts, Facebook Posts"
  },
  {
    label: "Portrait (4:5)",
    ratio: "4:5",
    width: 1080,
    height: 1350,
    description: "Instagram Portrait Posts"
  },
  {
    label: "Landscape (16:9)",
    ratio: "16:9",
    width: 1920,
    height: 1080,
    description: "YouTube, LinkedIn, Twitter"
  }
];

const CarouselMaker = () => {
  const [slides, setSlides] = useState([DEFAULT_SLIDE]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");

  const currentSlide = slides[currentSlideIndex];
  const currentAspectConfig = ASPECT_RATIOS.find(ar => ar.ratio === aspectRatio) || ASPECT_RATIOS[0];

  const addSlide = () => {
    // Create a new slide as a duplicate of the current one
    const newSlide: SlideData = { 
      ...JSON.parse(JSON.stringify(currentSlide)),
      id: uuidv4() 
    };
    
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one slide",
        variant: "destructive"
      });
      return;
    }

    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    
    // Adjust current slide index if needed
    if (index <= currentSlideIndex) {
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  };

  const updateSlide = (updatedSlide: SlideData) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    setSlides(newSlides);
  };

  const downloadCurrentSlide = async () => {
    const slideElement = document.getElementById(`slide-preview-${currentSlide.id}`);
    if (!slideElement) {
      toast({
        title: "Download failed",
        description: "Could not find slide element to download",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Preparing download",
        description: "Generating image...",
      });

      const canvas = await html2canvas(slideElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `slide-${currentSlideIndex + 1}.png`;
      link.href = image;
      link.click();
      
      toast({
        title: "Download complete",
        description: `Slide ${currentSlideIndex + 1} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error downloading slide:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while downloading the slide.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Selector */}
      <ProductSelector
        selectedProductId={selectedProduct?.id || null}
        onSelectProduct={setSelectedProduct}
      />
      
      {/* Aspect Ratio Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
        <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
          <SelectTrigger id="aspect-ratio" className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ASPECT_RATIOS.map((config) => (
              <SelectItem key={config.ratio} value={config.ratio}>
                <div>
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Export dimensions: {currentAspectConfig.width} × {currentAspectConfig.height}px
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-xl font-semibold mb-4">Edit Slide</h2>
              <CarouselEditor 
                slide={currentSlide} 
                updateSlide={updateSlide}
                downloadCurrentSlide={downloadCurrentSlide}
                selectedProduct={selectedProduct}
              />
              
              <div className="mt-6">
                <SlideManager
                  slides={slides}
                  currentSlideIndex={currentSlideIndex}
                  setCurrentSlideIndex={setCurrentSlideIndex}
                  addSlide={addSlide}
                  deleteSlide={deleteSlide}
                  aspectRatio={aspectRatio}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-[350px] sticky top-6 h-[calc(100vh-120px)] self-start">
          <div className="bg-white rounded-lg shadow-sm border p-4 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <CarouselPreview 
              slides={slides} 
              currentSlideIndex={currentSlideIndex}
              setCurrentSlideIndex={setCurrentSlideIndex}
              downloadAllSlides={() => {}} // This is a placeholder function as we handle the download in CarouselPreview directly
              aspectRatio={aspectRatio}
              aspectRatioConfig={currentAspectConfig}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselMaker;
