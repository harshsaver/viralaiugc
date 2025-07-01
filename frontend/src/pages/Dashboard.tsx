import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavbarWrapper from "@/components/NavbarWrapper";
import ContentGenerator from "@/components/ContentGenerator";
import VideoGrid from "@/components/VideoGrid";
import CarouselMaker from "@/components/carousel/CarouselMaker";
import GifsDisplay from "@/components/GifsDisplay";
import { toast } from "sonner";
import Videos from "./Videos";
import Carousels from "./Carousels";
import Products from "./Products";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab") || "aiugc";
  
  console.log("Dashboard rendering with tab:", tab);
  
  // Validate tab values
  const validTabs = ["aiugc", "videos", "carousels", "gifs", "products"];
  const currentTab = validTabs.includes(tab) ? tab : "aiugc";
  
  useEffect(() => {
    // Validate tab parameter
    if (!validTabs.includes(currentTab)) {
      navigate("/dashboard?tab=aiugc", { replace: true });
    }
  }, [currentTab, navigate, validTabs]);

  // Memoize the content to prevent unnecessary re-renders
  const content = useMemo(() => {
    switch (currentTab) {
      case "aiugc":
        return <ContentGenerator />;
      case "videos":
        return <Videos />;
      case "carousels":
        return <Carousels />;
      case "gifs":
        return <GifsDisplay />;
      case "products":
        return <Products />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Page not found</p>
          </div>
        );
    }
  }, [currentTab]);
  
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
