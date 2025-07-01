import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const LandingWaitlist = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Store email in a waitlist table (you'll need to create this table in Supabase)
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success("🎉 You're on the list! We'll notify you when we launch.");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg1.png" 
          alt="Background" 
          className="hidden md:block w-full h-full object-cover"
        />
        <img 
          src="/bg2.png" 
          alt="Background" 
          className="md:hidden w-full h-full object-cover"
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-green-800/20 to-green-900/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Anime-styled card with glassmorphism */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 border-4 border-green-400/50 transform hover:scale-105 transition-transform duration-300">
            {/* Title with anime-style font */}
            <h1 className="text-4xl md:text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 drop-shadow-lg">
              ReelPost AI
            </h1>
            
            {/* Playful subtitle */}
            <p className="text-center text-lg md:text-xl font-medium text-gray-700 mb-8 leading-relaxed">
              Create viral TikTok content with AI magic! ✨🎬
            </p>

            {/* Waitlist form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 text-lg border-2 border-green-300 focus:border-green-500 rounded-full bg-white/80 backdrop-blur-sm placeholder:text-gray-400 transition-all duration-300 focus:shadow-lg focus:shadow-green-200/50"
                  disabled={isSubmitting}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">🌟</span>
                    Joining...
                  </span>
                ) : (
                  "Join the Waitlist 🚀"
                )}
              </Button>
            </form>

            {/* Playful footer text */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Be the first to create viral content! 🎭
            </p>
          </div>

          {/* Floating anime elements */}
          <div className="absolute -top-10 -left-10 text-6xl animate-bounce">🌸</div>
          <div className="absolute -bottom-10 -right-10 text-6xl animate-pulse">🎋</div>
          <div className="absolute top-1/2 -left-20 text-4xl animate-spin-slow">⭐</div>
          <div className="absolute top-1/2 -right-20 text-4xl animate-spin-slow animation-delay-2000">✨</div>
        </div>
      </div>

      {/* Dev/Test link to dashboard - can be removed in production */}
      <Link 
        to="/dashboard" 
        className="absolute bottom-4 right-4 text-xs text-white/60 hover:text-white/80 transition-colors z-20"
      >
        Skip to Dashboard →
      </Link>
    </div>
  );
};

export default LandingWaitlist; 