import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SlideData, TextElement, TextPosition, BackgroundType } from "./types";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

// Define text size options
const TEXT_SIZE_OPTIONS = [
  { name: "Small", value: 16 },
  { name: "Medium", value: 24 },
  { name: "Large", value: 32 },
  { name: "X-Large", value: 42 }
];

// Fixed text color - white with black stroke
const TEXT_COLOR = "#FFFFFF";

interface CarouselEditorProps {
  slide: SlideData;
  updateSlide: (slide: SlideData) => void;
  downloadCurrentSlide: () => void;
  selectedProduct?: any;
}

const CarouselEditor = ({ slide, updateSlide, downloadCurrentSlide, selectedProduct }: CarouselEditorProps) => {
  const [activeTab, setActiveTab] = useState<string>("background");
  const [fileUploading, setFileUploading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<TextPosition>("center");
  const [fontSize, setFontSize] = useState(24); // Medium as default
  const [fontFamily, setFontFamily] = useState("Arial");
  const [isGeneratingText, setIsGeneratingText] = useState(false);

  const handleBackgroundTypeChange = (type: BackgroundType) => {
    updateSlide({
      ...slide,
      backgroundType: type,
    });
  };

  const handleBackgroundColorChange = (color: string) => {
    updateSlide({
      ...slide,
      backgroundColor: color,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isGrid = false, gridIndex = -1) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      if (isGrid) {
        const gridImages = [...(slide.gridImages || ["", "", "", ""])];
        gridImages[gridIndex] = base64String;

        updateSlide({
          ...slide,
          gridImages,
        });
      } else {
        updateSlide({
          ...slide,
          backgroundImage: base64String,
        });
      }
      setFileUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;

    const newTextElement: TextElement = {
      id: uuidv4(),
      text: textInput,
      color: TEXT_COLOR, // Fixed white color
      fontSize,
      fontFamily,
      position: textPosition,
    };

    updateSlide({
      ...slide,
      textElements: [...slide.textElements, newTextElement],
    });

    setTextInput("");
  };

  const removeTextElement = (id: string) => {
    updateSlide({
      ...slide,
      textElements: slide.textElements.filter(el => el.id !== id),
    });
  };

  const generateAIText = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    setIsGeneratingText(true);
    
    try {
      // Try Vercel serverless function first, then local backend
      const endpoints = [
        '/api/generate-carousel-text',
        'http://localhost:3000/generate-carousel-text'
      ];

      let lastError: Error | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product: selectedProduct,
              slideNumber: slide.textElements.length + 1,
              existingTexts: slide.textElements.map(el => el.text)
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Server error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.success && data.text) {
            setTextInput(data.text);
            toast.success("AI text generated!");
            return;
          } else {
            throw new Error(data.message || 'Failed to generate text');
          }
        } catch (error) {
          lastError = error as Error;
          // If it's not a network error, throw it immediately
          if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
            throw error;
          }
          // Otherwise, try the next endpoint
        }
      }

      // If all endpoints failed
      throw new Error('Unable to connect to AI service. Please ensure either the backend server is running locally or deploy to Vercel.');
    } catch (error: any) {
      console.error('Error generating text:', error);
      toast.error(error.message || 'Failed to generate AI text');
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <div>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
          <TabsTrigger value="text" className="flex-1">Text</TabsTrigger>
        </TabsList>
        
        <TabsContent value="background" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Background Type</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button 
                  variant={slide.backgroundType === "color" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("color")}
                  size="sm"
                >
                  Color
                </Button>
                <Button 
                  variant={slide.backgroundType === "image" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("image")}
                  size="sm"
                >
                  Image
                </Button>
                <Button 
                  variant={slide.backgroundType === "grid" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("grid")}
                  size="sm"
                >
                  2x2
                </Button>
                <Button 
                  variant={slide.backgroundType === "grid-2x1" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("grid-2x1")}
                  size="sm"
                >
                  2x1
                </Button>
                <Button 
                  variant={slide.backgroundType === "grid-1x2" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("grid-1x2")}
                  size="sm"
                >
                  1x2
                </Button>
                <Button 
                  variant={slide.backgroundType === "grid-3x3" ? "default" : "outline"}
                  onClick={() => handleBackgroundTypeChange("grid-3x3")}
                  size="sm"
                >
                  3x3
                </Button>
              </div>
            </div>
          </div>
          
          {slide.backgroundType === "color" && (
            <div>
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="bg-color"
                  type="color" 
                  value={slide.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input 
                  type="text" 
                  value={slide.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-32"
                />
              </div>
            </div>
          )}
          
          {slide.backgroundType === "image" && (
            <div>
              <Label>Background Image</Label>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  disabled={fileUploading}
                />
                
                {slide.backgroundImage && (
                  <div className="mt-3">
                    <img 
                      src={slide.backgroundImage} 
                      alt="Background preview" 
                      className="max-h-32 rounded-md border" 
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {slide.backgroundType === "grid" && (
            <div>
              <Label>2x2 Grid Images</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true, index)}
                      className="text-xs"
                      disabled={fileUploading}
                    />
                    
                    {slide.gridImages?.[index] && (
                      <img 
                        src={slide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md border" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {slide.backgroundType === "grid-2x1" && (
            <div>
              <Label>2x1 Grid Images</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true, index)}
                      className="text-xs"
                      disabled={fileUploading}
                    />
                    
                    {slide.gridImages?.[index] && (
                      <img 
                        src={slide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md border" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {slide.backgroundType === "grid-1x2" && (
            <div>
              <Label>1x2 Grid Images</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true, index)}
                      className="text-xs"
                      disabled={fileUploading}
                    />
                    
                    {slide.gridImages?.[index] && (
                      <img 
                        src={slide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`} 
                        className="h-32 w-full object-cover rounded-md border" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {slide.backgroundType === "grid-3x3" && (
            <div>
              <Label>3x3 Grid Images</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true, index)}
                      className="text-xs"
                      disabled={fileUploading}
                    />
                    
                    {slide.gridImages?.[index] && (
                      <img 
                        src={slide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`} 
                        className="h-20 w-full object-cover rounded-md border" 
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="text" className="mt-4 space-y-4">
          <div>
            <Label htmlFor="text-input">Add Text</Label>
            <div className="flex gap-2 mt-2">
              <Input 
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                className="flex-1"
              />
              <Button onClick={addTextElement}>Add</Button>
              {selectedProduct && (
                <Button 
                  onClick={generateAIText} 
                  disabled={isGeneratingText}
                  variant="outline"
                >
                  {isGeneratingText ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Generate
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <Label>Text Size</Label>
            <div className="flex gap-2 mt-2">
              {TEXT_SIZE_OPTIONS.map((size) => (
                <Button 
                  key={size.name}
                  variant={fontSize === size.value ? "default" : "outline"}
                  onClick={() => setFontSize(size.value)}
                  size="sm"
                >
                  {size.name}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Text Position</Label>
            <div className="flex gap-2 mt-2">
              <Button 
                variant={textPosition === "top" ? "default" : "outline"}
                onClick={() => setTextPosition("top")}
                size="sm"
              >
                Top
              </Button>
              <Button 
                variant={textPosition === "center" ? "default" : "outline"}
                onClick={() => setTextPosition("center")}
                size="sm"
              >
                Center
              </Button>
              <Button 
                variant={textPosition === "bottom" ? "default" : "outline"}
                onClick={() => setTextPosition("bottom")}
                size="sm"
              >
                Bottom
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Text Elements</h3>
            
            {slide.textElements.length === 0 ? (
              <p className="text-muted-foreground text-sm">No text elements added yet.</p>
            ) : (
              <div className="space-y-2">
                {slide.textElements.map((element) => (
                  <div key={element.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div>
                      <p className="font-medium">
                        {element.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {TEXT_SIZE_OPTIONS.find(size => size.value === element.fontSize)?.name || element.fontSize}px · {element.position}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeTextElement(element.id)}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Button onClick={downloadCurrentSlide} className="w-full">
          Download This Slide
        </Button>
      </div>
    </div>
  );
};

export default CarouselEditor;
