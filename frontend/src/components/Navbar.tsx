import { NavLink } from "react-router-dom";
import { Car, User, Star, History } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Car },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/reviews", label: "Reviews", icon: Star },
    { path: "/ride-history", label: "Ride History", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] w-full">
      <div className="mx-auto max-w-full px-8">
        <div className="flex h-14 items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 ml-2 sm:ml-4">
            <Car className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span className="text-xl font-bold">CabPro</span>
          </NavLink>

          <div className="flex gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
