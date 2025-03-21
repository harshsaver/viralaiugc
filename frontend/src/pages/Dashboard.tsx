
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavbarWrapper from "@/components/NavbarWrapper";
import ContentGenerator from "@/components/ContentGenerator";
import VideoGrid from "@/components/VideoGrid";
import CarouselMaker from "@/components/carousel/CarouselMaker";
import GifsDisplay from "@/components/GifsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get("tab") || "aiugc";
  
  useEffect(() => {
    // Validate tab parameter
    const validTabs = ["aiugc", "videos", "carousels", "gifs"];
    if (!validTabs.includes(currentTab)) {
      navigate("/dashboard?tab=aiugc", { replace: true });
    }
  }, [currentTab, navigate]);

  // Memoize the content to prevent unnecessary re-renders
  const content = useMemo(() => {
    switch (currentTab) {
      case "aiugc":
        return <ContentGenerator />;
      case "videos":
        return (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">My Videos</h1>
            <VideoGrid videoType="aiugc" />
          </div>
        );
      case "carousels":
        return (
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">TikTok Carousel Maker</h1>
            <CarouselMaker />
          </div>
        );
      case "gifs":
        return <GifsDisplay />;
      default:
        return <ContentGenerator />;
    }
  }, [currentTab]);

  // Add React Query provider to App.tsx and enable devtools in App.tsx
  
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <NavbarWrapper>
        <main className="flex-1 overflow-y-auto">
          {content}
        </main>
      </NavbarWrapper>
    </div>
  );
};

export default Dashboard;
