import { useState, memo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import VideoGrid from "@/components/VideoGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enableRealtimeForGeneratedVideos } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type VideoType = Database["public"]["Enums"]["video_type"];

// Memoize VideoGrid to prevent unnecessary re-renders
const MemoizedVideoGrid = memo(VideoGrid);

const MyVideos = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<VideoType>("aiugc");
  
  // Initialize realtime functionality when the component mounts
  useEffect(() => {
    enableRealtimeForGeneratedVideos();
  }, []);
  
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">My Videos</h1>
        
        <Tabs defaultValue="aiugc" onValueChange={(value) => setActiveTab(value as VideoType)}>
          <TabsList className="mb-4 md:mb-6">
            <TabsTrigger value="aiugc">AI UGC Videos</TabsTrigger>
            <TabsTrigger value="meme">Meme Videos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="aiugc">
            <MemoizedVideoGrid videoType="aiugc" />
          </TabsContent>
          
          <TabsContent value="meme">
            <MemoizedVideoGrid videoType="meme" />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default MyVideos;
