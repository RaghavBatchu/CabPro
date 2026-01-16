import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/profile", label: "Profile" },
  { to: "/reviews", label: "Reviews" },
];

const AppTabs = () => {
  const location = useLocation();
  return (
    <div className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative">
          <div className="flex items-center gap-1 py-2">
            {tabs.map((t) => {
              const active = location.pathname.startsWith(t.to);
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={`relative rounded-full px-4 py-2 text-sm transition-all ${
                    active
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppTabs;


