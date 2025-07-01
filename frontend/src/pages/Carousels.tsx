import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CarouselMaker from "@/components/carousel/CarouselMaker";

const Carousels = () => {
  const { user } = useAuth();
  
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">TikTok Carousel Maker</h1>
        <CarouselMaker />
      </div>
    </main>
  );
};

export default Carousels;
