import { Home, User, Image, Film, Calendar, BarChart2, HelpCircle, Settings, Layers, Grid, LogOut, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthDialog from "@/components/AuthDialog";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
const NavItem = ({
  icon,
  label,
  to,
  active,
  disabled,
  onClick
}: NavItemProps) => {
  if (disabled) {
    return <Popover>
        <PopoverTrigger asChild>
          <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer smooth-transition text-muted-foreground/60", "hover:bg-secondary/50")}>
            <div className="w-5 h-5 shrink-0">{icon}</div>
            <span className="text-sm font-medium">{label}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-auto p-3">
          <p className="text-sm font-medium">Coming soon!</p>
        </PopoverContent>
      </Popover>;
  }
  if (onClick) {
    return <div onClick={onClick} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer smooth-transition", active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground")}>
        <div className="w-5 h-5 shrink-0">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>;
  }
  return <Link to={to || "#"}>
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer smooth-transition", active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground")}>
        <div className="w-5 h-5 shrink-0">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>;
};
const Navbar = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "aiugc";
  const {
    user,
    signOut
  } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    plan: string;
    credits?: number;
  } | null>(null);
  const fetchUserProfile = async () => {
    if (user) {
      const {
        data,
        error
      } = await supabase.from('profiles').select('plan, credits').eq('id', user.id).single();
      if (!error && data) {
        setUserProfile(data);
      }
    }
  };
  useEffect(() => {
    fetchUserProfile();
  }, [user]);
  return <aside className="w-64 h-screen border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center w-8 h-8 bg-black text-white rounded">
            <Film size={16} />
          </div>
          <h1 className="text-lg font-semibold">Viral AI UGC</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem icon={<Home size={18} />} label="AI UGC Avatars" to="/dashboard?tab=aiugc" active={currentTab === "aiugc"} />
        <NavItem icon={<Film size={18} />} label="My Videos" to="/dashboard?tab=videos" active={currentTab === "videos"} />
        <NavItem icon={<Grid size={18} />} label="Carousels" to="/dashboard?tab=carousels" active={currentTab === "carousels"} />
        <NavItem icon={<Image size={18} />} label="Gifs" to="/dashboard?tab=gifs" active={currentTab === "gifs"} />
        <NavItem icon={<Layers size={18} />} label="Memes" disabled={true} />
        <NavItem icon={<Calendar size={18} />} label="Schedule" disabled={true} />
      </nav>
      
      <div className="border-t border-border p-4 space-y-1">
        <NavItem icon={<HelpCircle size={18} />} label="Support" onClick={() => window.open("https://x.com/rushabtated4", "_blank", "noopener,noreferrer")} />
        
        <Popover>
          <PopoverTrigger asChild>
            <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer smooth-transition", "hover:bg-secondary text-foreground")}>
              <div className="w-5 h-5 shrink-0"><Settings size={18} /></div>
              <span className="text-sm font-medium">Settings</span>
            </div>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-64 p-4">
            <div className="space-y-4">
              <h3 className="font-medium">User Settings</h3>
              
              {user && <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-medium">
                    {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile && <span className="capitalize">{userProfile.plan} Plan</span>}
                    </p>
                  </div>
                </div>}
              
              {userProfile && userProfile.plan !== 'free' && <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.location.href = '/settings'}>
                  Manage Subscription
                </Button>}
              
              {user && <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start font-normal text-destructive hover:text-destructive hover:bg-destructive/10">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>}
            </div>
          </PopoverContent>
        </Popover>
        <NavItem icon={<ExternalLink size={18} />} label="Self Host" to="/self-host" onClick={() => window.open("/self-host", "_blank", "noopener,noreferrer")} />
      </div>
      
      <div className="p-4 border-t border-border">
        {user ? <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-medium">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userProfile && <span className="capitalize">{userProfile.plan} Plan</span>}
                </p>
              </div>
            </div>
            
            {userProfile && userProfile.plan === 'free' && <div className="flex items-center justify-between mt-2 p-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-xs font-medium">Credits</span>
                </div>
                <span className="text-xs font-bold">{userProfile.credits || 0}</span>
              </div>}
            
            {userProfile && userProfile.plan !== 'free' && <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.location.href = '/settings'}>
                Manage Subscription
              </Button>}
          </div> : <div className="space-y-2">
            <p className="text-sm font-medium">Not signed in</p>
            <Button variant="default" size="sm" className="w-full" onClick={() => setIsAuthDialogOpen(true)}>
              Sign Up
            </Button>
          </div>}
      </div>
      
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </aside>;
};
export default Navbar;