import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background Images with Green Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/bg1.png" 
          alt="Background" 
          className="hidden md:block w-full h-full object-cover opacity-80"
        />
        <img 
          src="/bg2.png" 
          alt="Background" 
          className="md:hidden w-full h-full object-cover opacity-80"
        />
        {/* Green gradient overlay to match the autumn theme but in green */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-green-800/60 to-emerald-950/80" />
      </div>

      {/* UI Wireframe Elements (decorative) */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none opacity-50">
        {/* Left side wireframes */}
        <div className="absolute left-10 top-20 w-64 h-96 border border-green-400/30 rounded-lg transform -rotate-6 animate-float" />
        <div className="absolute left-20 bottom-32 w-48 h-64 border border-green-400/30 rounded-lg transform rotate-3">
          <div className="m-4 space-y-2">
            <div className="h-8 bg-green-400/20 rounded" />
            <div className="h-8 bg-green-400/20 rounded" />
          </div>
        </div>
        
        {/* Right side wireframes */}
        <div className="absolute right-16 top-16 w-56 h-80 border border-green-400/30 rounded-lg transform rotate-6 animate-float" style={{ animationDelay: '3s' }}>
          <div className="m-4">
            <div className="w-12 h-12 bg-green-400/20 rounded-full mx-auto mb-4" />
            <div className="h-6 bg-green-400/20 rounded mb-2" />
            <div className="h-6 bg-green-400/20 rounded" />
          </div>
        </div>
        <div className="absolute right-32 bottom-20 w-48 h-32 border border-green-400/30 rounded-lg transform -rotate-12" />
        
        {/* Floating UI elements */}
        <div className="absolute left-1/4 top-1/3 w-32 h-20 border border-green-400/30 rounded" />
        <div className="absolute right-1/3 top-1/4 w-40 h-24 border border-green-400/30 rounded transform rotate-45" />
        <div className="absolute left-1/3 bottom-1/4 w-36 h-28 border border-green-400/30 rounded-lg transform -rotate-12" />
        <div className="absolute right-1/4 bottom-1/3 w-44 h-32 border border-green-400/30 rounded-lg transform rotate-6" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Small Login text in top right */}
        <a 
          href="/dashboard" 
          className="absolute top-8 right-8 text-sm text-green-300/50 hover:text-green-300/70 transition-colors font-medium"
          style={{ letterSpacing: '0.05em' }}
        >
          Login
        </a>

        {/* Logo/Title */}
        <h1 className="text-7xl md:text-9xl font-bold text-white mb-10 tracking-tight text-shadow-lg" 
            style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          ReelPost
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-green-100/90 mb-14 text-center max-w-2xl font-light tracking-wide">
          Create viral TikTok content at the speed of thought
        </p>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email for early access"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-14 px-6 text-base bg-white/10 backdrop-blur-sm border-green-400/40 text-white placeholder:text-green-200/70 rounded-full focus:bg-white/15 focus:border-green-400/60 transition-all duration-300"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-14 px-10 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Joining...
                </span>
              ) : (
                "Join Waitlist"
              )}
            </Button>
          </div>
        </form>

        {/* Bottom text */}
        <p className="text-sm text-green-200/70 mt-8 text-center max-w-lg font-light">
          Be among the first to create viral content at the speed of thought
        </p>
      </div>
    </div>
  );
};

export default LandingWaitlist; 