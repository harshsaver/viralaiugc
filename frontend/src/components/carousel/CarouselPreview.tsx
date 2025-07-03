import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { SlideData, AspectRatio, AspectRatioConfig } from "./types";
import JSZip from "jszip";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface CarouselPreviewProps {
  slides: SlideData[];
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  downloadAllSlides: () => void;
  aspectRatio?: AspectRatio;
  aspectRatioConfig?: AspectRatioConfig;
}

const CarouselPreview = ({ 
  slides, 
  currentSlideIndex, 
  setCurrentSlideIndex,
  downloadAllSlides,
  aspectRatio = "9:16",
  aspectRatioConfig = {
    label: "Stories/Reels (9:16)",
    ratio: "9:16",
    width: 1080,
    height: 1920,
    description: "TikTok, Instagram Stories, YouTube Shorts"
  }
}: CarouselPreviewProps) => {
  const currentSlide = slides[currentSlideIndex];
  
  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleDownloadAllSlides = async () => {
    toast({
      title: "Preparing download",
      description: "Creating zip file with all slides...",
    });
    
    try {
      // Create a container div to render each slide for capturing
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);
      
      const zip = new JSZip();
      let processedCount = 0;
      let errorCount = 0;
      
      // Process each slide one by one
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        
        try {
          // Create a temporary div to render the slide
          const slideDiv = document.createElement('div');
          slideDiv.style.width = `${aspectRatioConfig.width}px`;
          slideDiv.style.height = `${aspectRatioConfig.height}px`;
          slideDiv.style.position = 'relative';
          
          // Set background style based on slide settings
          if (slide.backgroundType === "color") {
            slideDiv.style.backgroundColor = slide.backgroundColor;
          } else if (slide.backgroundType === "image") {
            slideDiv.style.backgroundImage = `url(${slide.backgroundImage})`;
            slideDiv.style.backgroundSize = "cover";
            slideDiv.style.backgroundPosition = "center";
          } else if (slide.backgroundType.startsWith("grid") && slide.gridImages) {
            // Create grid layout
            slideDiv.style.display = "grid";
            
            let gridSize = 4;
            if (slide.backgroundType === "grid") {
              slideDiv.style.gridTemplateColumns = "1fr 1fr";
              slideDiv.style.gridTemplateRows = "1fr 1fr";
              gridSize = 4;
            } else if (slide.backgroundType === "grid-2x1") {
              slideDiv.style.gridTemplateColumns = "1fr 1fr";
              slideDiv.style.gridTemplateRows = "1fr";
              gridSize = 2;
            } else if (slide.backgroundType === "grid-1x2") {
              slideDiv.style.gridTemplateColumns = "1fr";
              slideDiv.style.gridTemplateRows = "1fr 1fr";
              gridSize = 2;
            } else if (slide.backgroundType === "grid-3x3") {
              slideDiv.style.gridTemplateColumns = "1fr 1fr 1fr";
              slideDiv.style.gridTemplateRows = "1fr 1fr 1fr";
              gridSize = 9;
            }
            
            for (let j = 0; j < gridSize; j++) {
              const gridCell = document.createElement('div');
              gridCell.style.position = "relative";
              gridCell.style.overflow = "hidden";
              
              if (slide.gridImages[j]) {
                const img = document.createElement('img');
                img.src = slide.gridImages[j];
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "cover";
                gridCell.appendChild(img);
              } else {
                gridCell.style.backgroundColor = "#f3f4f6";
                const noImg = document.createElement('div');
                noImg.textContent = "No image";
                noImg.style.display = "flex";
                noImg.style.alignItems = "center";
                noImg.style.justifyContent = "center";
                noImg.style.height = "100%";
                noImg.style.color = "#9ca3af";
                noImg.style.fontSize = "14px";
                gridCell.appendChild(noImg);
              }
              
              slideDiv.appendChild(gridCell);
            }
          }
          
          // Add text elements
          if (slide.textElements) {
            for (const textEl of slide.textElements) {
              const textDiv = document.createElement('div');
              textDiv.style.position = "absolute";
              textDiv.style.width = "100%";
              
              // Scale padding and positioning based on canvas dimensions
              const positionScale = Math.min(aspectRatioConfig.width / 1080, aspectRatioConfig.height / 1920);
              textDiv.style.padding = `0 ${16 * positionScale}px`;
              textDiv.style.textAlign = "center";
              
              if (textEl.position === "top") {
                textDiv.style.top = `${32 * positionScale}px`;
              } else if (textEl.position === "bottom") {
                textDiv.style.bottom = `${32 * positionScale}px`;
              } else {
                textDiv.style.top = "50%";
                textDiv.style.transform = "translateY(-50%)";
              }
              
              const p = document.createElement('p');
              p.textContent = textEl.text;
              p.style.color = "#FFFFFF";
              
              // Scale font size based on canvas dimensions
              const scale = Math.min(aspectRatioConfig.width / 1080, aspectRatioConfig.height / 1920) * 3;
              p.style.fontSize = `${textEl.fontSize * scale}px`;
              
              p.style.fontFamily = textEl.fontFamily;
              p.style.fontWeight = "bold";
              p.style.textShadow = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000';
              p.style.maxWidth = "100%";
              p.style.margin = "0 auto";
              p.style.whiteSpace = "pre-wrap";
              p.style.wordBreak = "break-word";
              p.style.lineHeight = "1.25";
              
              textDiv.appendChild(p);
              slideDiv.appendChild(textDiv);
            }
          }
          
          // Add sticker elements if they exist
          if (slide.stickerElements) {
            for (const sticker of slide.stickerElements) {
              if (sticker.src) {
                const stickerDiv = document.createElement('div');
                stickerDiv.style.position = "absolute";
                
                // Scale sticker position and size based on canvas dimensions
                const scale = Math.min(aspectRatioConfig.width / 1080, aspectRatioConfig.height / 1920) * 3;
                stickerDiv.style.left = `${sticker.x * scale}px`;
                stickerDiv.style.top = `${sticker.y * scale}px`;
                stickerDiv.style.width = `${sticker.width * scale}px`;
                stickerDiv.style.height = `${sticker.height * scale}px`;
                
                const img = document.createElement('img');
                img.src = sticker.src;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "contain";
                
                stickerDiv.appendChild(img);
                slideDiv.appendChild(stickerDiv);
              }
            }
          }
          
          // Append to container and render
          container.appendChild(slideDiv);
          
          // Capture the rendered slide
          const canvas = await html2canvas(slideDiv, {
            scale: 1, // Use scale:1 because we've already scaled the elements
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
          });
          
          // Convert to blob and add to zip
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/png', 1.0); // Use maximum quality
          });
          
          zip.file(`slide-${i + 1}.png`, blob);
          processedCount++;
          
          // Clean up
          container.removeChild(slideDiv);
          
        } catch (err) {
          console.error(`Error processing slide ${i + 1}:`, err);
          errorCount++;
        }
      }
      
      // Clean up container
      document.body.removeChild(container);
      
      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = 'all-slides.zip';
      link.click();
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(zipUrl), 100);
      
      toast({
        title: "Download complete",
        description: `${processedCount} slides have been packaged into a zip file.${
          errorCount > 0 ? ` (${errorCount} slides could not be processed)` : ''
        }`,
      });
    } catch (error) {
      console.error("Error creating zip file:", error);
      toast({
        title: "Download failed",
        description: "An error occurred while creating the zip file.",
        variant: "destructive"
      });
    }
  };
  
  // Get aspect ratio class for preview
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "9:16":
        return "aspect-[9/16]";
      case "1:1":
        return "aspect-[1/1]";
      case "4:5":
        return "aspect-[4/5]";
      case "16:9":
        return "aspect-[16/9]";
      default:
        return "aspect-[9/16]";
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className={`relative w-full ${aspectRatio === "16:9" ? "max-w-2xl" : "max-w-sm"} mx-auto flex-1`}>
        <div className={`${getAspectRatioClass()} bg-white rounded-md shadow-md overflow-hidden border`}>
          <div 
            id={`slide-preview-${currentSlide.id}`}
            className="h-full relative"
            style={{ 
              backgroundColor: currentSlide.backgroundType === "color" ? currentSlide.backgroundColor : undefined,
              backgroundImage: currentSlide.backgroundType === "image" ? `url(${currentSlide.backgroundImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Grid layout */}
            {currentSlide.backgroundType === "grid" && currentSlide.gridImages && (
              <div className="grid grid-cols-2 grid-rows-2 h-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="relative overflow-hidden">
                    {currentSlide.gridImages?.[index] ? (
                      <img 
                        src={currentSlide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 2x1 Grid layout */}
            {currentSlide.backgroundType === "grid-2x1" && currentSlide.gridImages && (
              <div className="grid grid-cols-2 grid-rows-1 h-full">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="relative overflow-hidden">
                    {currentSlide.gridImages?.[index] ? (
                      <img 
                        src={currentSlide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 1x2 Grid layout */}
            {currentSlide.backgroundType === "grid-1x2" && currentSlide.gridImages && (
              <div className="grid grid-cols-1 grid-rows-2 h-full">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="relative overflow-hidden">
                    {currentSlide.gridImages?.[index] ? (
                      <img 
                        src={currentSlide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 3x3 Grid layout */}
            {currentSlide.backgroundType === "grid-3x3" && currentSlide.gridImages && (
              <div className="grid grid-cols-3 grid-rows-3 h-full">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="relative overflow-hidden">
                    {currentSlide.gridImages?.[index] ? (
                      <img 
                        src={currentSlide.gridImages[index]} 
                        alt={`Grid image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Text elements */}
            {currentSlide.textElements.map((textElement) => (
              <div
                key={textElement.id}
                className={`absolute w-full px-4 text-center ${
                  textElement.position === "top" ? "top-8" :
                  textElement.position === "bottom" ? "bottom-8" :
                  "top-1/2 -translate-y-1/2"
                }`}
              >
                <p
                  style={{
                    color: "#FFFFFF",
                    fontSize: `${textElement.fontSize}px`,
                    fontFamily: textElement.fontFamily,
                    fontWeight: "bold",
                    textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                    maxWidth: "100%",
                    margin: "0 auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    lineHeight: "1.25"
                  }}
                >
                  {textElement.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
            className="rounded-md"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="rounded-md"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="mt-2 text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          Slide {currentSlideIndex + 1} of {slides.length}
        </p>
        <p className="text-xs text-muted-foreground">
          {aspectRatioConfig.description}
        </p>
      </div>
      
      <div className="mt-6 w-full">
        <Button
          variant="default"
          size="lg"
          onClick={handleDownloadAllSlides}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-1" />
          Download All Slides
        </Button>
      </div>
    </div>
  );
};

export default CarouselPreview;
