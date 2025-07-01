import { Home, Image, Film, Calendar, Layers, Grid, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NavItemProps {
  icon: any;
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

  return <aside className="w-64 h-screen border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center w-8 h-8 bg-black text-white rounded">
            <Film size={16} />
          </div>
          <h1 className="text-lg font-semibold">ReelPost</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem icon={<Home size={18} />} label="Create UGC Video" to="/dashboard?tab=aiugc" active={currentTab === "aiugc"} />
        <NavItem icon={<Grid size={18} />} label="Carousels" to="/dashboard?tab=carousels" active={currentTab === "carousels"} />
        <NavItem icon={<Image size={18} />} label="Meme Generator" to="/dashboard?tab=gifs" active={currentTab === "gifs"} />
        <NavItem icon={<Package size={18} />} label="Products" to="/dashboard?tab=products" active={currentTab === "products"} />
        <NavItem icon={<Layers size={18} />} label="Memes" disabled={true} />
        <NavItem icon={<Calendar size={18} />} label="Schedule" disabled={true} />
        
        {/* Separator */}
        <div className="my-4 border-t border-border" />
        
        {/* My Videos in a separate section */}
        <div className="text-xs font-medium text-muted-foreground px-4 pb-2 uppercase tracking-wider">Your Content</div>
        <NavItem icon={<Film size={18} />} label="My Videos" to="/dashboard?tab=videos" active={currentTab === "videos"} />
      </nav>
      
      <div className="border-t border-border p-4 space-y-1">
        {/* Empty footer section */}
      </div>
    </aside>;
};
export default Navbar;