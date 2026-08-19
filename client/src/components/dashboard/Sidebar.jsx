import {
  LayoutDashboard,
  Map,
  Route,
  CalendarCheck,
  User,
  LogOut,
  Bus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Routes",
    icon: Route,
  },
  {
    label: "Bookings",
    icon: CalendarCheck,
  },
  {
    label: "Map",
    icon: Map,
  },
];

function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bus className="h-5 w-5" />
        </div>

        <div>
          <h1 className="font-semibold">Public transport booking system</h1>
          <p className="text-xs text-muted-foreground">
            Provider Portal
          </p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              variant={
                item.label === "Dashboard" ? "secondary" : "ghost"
              }
              className="w-full justify-start gap-3"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              Service Provider
            </p>
            <p className="truncate text-xs text-muted-foreground">
              provider@example.com
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export default Sidebar;
