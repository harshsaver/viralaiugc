import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBackground } from "@/services/backgroundService";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BackgroundUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackgroundUploadDialog = ({ isOpen, onClose }: BackgroundUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check if it's an image
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Check if it's an image
      if (!droppedFile.type.startsWith('image/')) {
        toast.error('Please drop an image file');
        return;
      }
      
      // Check file size
      if (droppedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setFile(droppedFile);
      const objectUrl = URL.createObjectURL(droppedFile);
      setPreviewUrl(objectUrl);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadBackground = async () => {
    if (!user || !file) {
      toast.error("Missing user or file");
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total || 0) * 100));
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Create background record in database
      await createBackground(user.id, publicUrlData.publicUrl);
      
      // Create thumbnail
      // We're using the same image as thumbnail for now,
      // but you could implement a separate thumbnail generation process

      toast.success('Background uploaded successfully');
      resetUpload();
      onClose();
      
      // Trigger event to refresh the background grid
      window.dispatchEvent(new CustomEvent('backgroundUploaded'));
      
    } catch (error: any) {
      console.error('Error uploading background:', error);
      toast.error(error.message || 'Failed to upload background');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Background</DialogTitle>
          <DialogDescription>
            Upload an image to use as background for your gifs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors",
              previewUrl ? "border-primary" : "border-border"
            )}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-md"
                />
                <button 
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Drag and drop an image, or click to browse</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or GIF (max 5MB)</p>
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="text-sm text-center">
                {uploadProgress}% Uploaded
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={uploadBackground}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <UploadCloud className="h-4 w-4" />
                Upload
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BackgroundUploadDialog;
