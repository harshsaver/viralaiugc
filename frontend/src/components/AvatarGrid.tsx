
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchTemplates, fetchUserGeneratedTemplates, Template, TemplateType } from "@/services/templateService";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import VideoUploadDialog from "./VideoUploadDialog";

interface AvatarGridProps {
  step: number;
  totalSteps: number;
  selectedAvatar: number | null;
  onSelectAvatar: (index: number) => void;
  onSelectTemplate?: (template: Template) => void;
  templateType?: TemplateType;
}

const AvatarGrid = ({ 
  step, 
  totalSteps, 
  selectedAvatar, 
  onSelectAvatar,
  onSelectTemplate,
  templateType
}: AvatarGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default value
  const [activeTab, setActiveTab] = useState<string>(templateType || 'aiavatar');
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const totalPages = Math.ceil((templates?.length || 0) / itemsPerPage) || 1;

  useEffect(() => {
    const calculateItemsPerPage = () => {
      if (!containerRef.current) return;
      
      const computedStyle = window.getComputedStyle(containerRef.current);
      const gridTemplateColumns = computedStyle.getPropertyValue('grid-template-columns');
      const columnCount = gridTemplateColumns.split(' ').length;
      
      const desiredRows = 2;
      const calculatedItemsPerPage = columnCount * desiredRows;
      
      setItemsPerPage(calculatedItemsPerPage);
    };

    calculateItemsPerPage();
    
    const handleResize = () => {
      calculateItemsPerPage();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setCurrentPage(1);
      
      let data: Template[] = [];
      
      if (activeTab === 'madebyme') {
        // Fetch user generated templates
        if (user?.id) {
          data = await fetchUserGeneratedTemplates(user.id);
        }
      } else {
        // Fetch templates based on template type
        data = await fetchTemplates(activeTab as TemplateType);
      }
      
      setTemplates(data);
    } catch (error) {
      toast.error("Failed to load templates");
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [activeTab, user?.id]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleAvatarClick = (index: number, template?: Template) => {
    onSelectAvatar(index);
    if (template && onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleUploadSuccess = () => {
    loadTemplates();
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return templates.slice(startIndex, endIndex);
  };

  const renderTemplates = () => {
    if (isLoading) {
      return Array.from({ length: itemsPerPage }).map((_, index) => (
        <div 
          key={`skeleton-${index}`}
          className="relative rounded-lg overflow-hidden bg-gray-200 animate-pulse"
        >
          <AspectRatio ratio={9/16}>
            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
          </AspectRatio>
        </div>
      ));
    }

    if (templates.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          {activeTab === 'madebyme' ? (
            <>
              <User className="h-10 w-10 mb-2 text-muted-foreground/60" />
              <p>You haven't created any templates yet</p>
              {user && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsVideoUploadOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              )}
            </>
          ) : (
            <p>No templates available</p>
          )}
        </div>
      );
    }

    return getCurrentPageItems().map((template, index) => (
      <div 
        key={`template-${template.id || index}`} 
        className={cn(
          "relative rounded-lg overflow-hidden cursor-pointer border border-border smooth-transition",
          selectedAvatar === ((currentPage - 1) * itemsPerPage + index) && "avatar-selected"
        )}
        onClick={() => handleAvatarClick((currentPage - 1) * itemsPerPage + index, template as Template)}
      >
        <AspectRatio ratio={9/16}>
          <img
            src={template.image_link}
            alt={`Template ${template.id || index}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </AspectRatio>
      </div>
    ));
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">{step}. {templateType ? 'Gifs' : 'AI Avatar'}</h3>
          {!templateType && (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="ml-2">
              <TabsList className="h-7">
                <TabsTrigger value="aiavatar" className="text-xs px-3 py-1">AI Avatar</TabsTrigger>
                <TabsTrigger value="game" className="text-xs px-3 py-1">Game</TabsTrigger>
                <TabsTrigger value="madebyme" className="text-xs px-3 py-1">Made by Me</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'madebyme' && user && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsVideoUploadOpen(true)}
              className="h-7 text-xs px-3 py-1"
            >
              <Plus className="mr-1 h-3 w-3" />
              Upload
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{currentPage}/{totalPages || 1}</span>
          <div className="flex">
            <button 
              onClick={prevPage}
              disabled={currentPage === 1 || templates.length === 0}
              className={cn(
                "p-1 rounded-l border border-r-0 flex items-center justify-center", 
                (currentPage === 1 || templates.length === 0) ? "text-muted-foreground cursor-not-allowed" : "hover:bg-secondary"
              )}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages || templates.length === 0}
              className={cn(
                "p-1 rounded-r border flex items-center justify-center", 
                (currentPage === totalPages || templates.length === 0) ? "text-muted-foreground cursor-not-allowed" : "hover:bg-secondary"
              )}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
      >
        {renderTemplates()}
      </div>

      <VideoUploadDialog 
        isOpen={isVideoUploadOpen}
        onClose={() => setIsVideoUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default AvatarGrid;
