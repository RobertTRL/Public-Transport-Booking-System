import {
  Bus,
  CalendarCheck,
  MapPin,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    title: "Active Routes",
    value: "12",
    description: "Currently operating",
    icon: MapPin,
  },
  {
    title: "Bookings",
    value: "248",
    description: "Total bookings",
    icon: CalendarCheck,
  },
  {
    title: "Customers",
    value: "184",
    description: "Unique passengers",
    icon: Users,
  },
  {
    title: "Vehicles",
    value: "24",
    description: "Available vehicles",
    icon: Bus,
  },
];

function ProviderDashboard() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 space-y-6 p-6">
          <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="text-muted-foreground">
                Here's what's happening with your transport services today.
              </p>
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Route
            </Button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>

                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>

                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stat.value}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Routes</CardTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Your currently operating routes
                    </p>
                  </div>

                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">CBD → Westlands</p>
                    <p className="text-sm text-muted-foreground">
                      8 stops · Every 15 min
                    </p>
                  </div>

                  <span className="text-sm font-medium">
                    8 vehicles
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">CBD → Kilimani</p>
                    <p className="text-sm text-muted-foreground">
                      6 stops · Every 20 min
                    </p>
                  </div>

                  <span className="text-sm font-medium">
                    5 vehicles
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">CBD → Kasarani</p>
                    <p className="text-sm text-muted-foreground">
                      10 stops · Every 30 min
                    </p>
                  </div>

                  <span className="text-sm font-medium">
                    6 vehicles
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Map</CardTitle>

                <p className="text-sm text-muted-foreground">
                  Overview of your active routes and stops
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/50">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                    <p className="font-medium">Route map</p>

                    <p className="text-sm text-muted-foreground">
                      Map integration will appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>

              <p className="text-sm text-muted-foreground">
                Latest passenger bookings across your routes
              </p>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-4 border-b p-4 text-sm font-medium">
                  <span>Passenger</span>
                  <span>Route</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>

                <div className="grid grid-cols-4 p-4 text-sm">
                  <span>John Doe</span>
                  <span>CBD → Westlands</span>
                  <span>Today, 4:30 PM</span>
                  <span className="font-medium">Confirmed</span>
                </div>

                <div className="grid grid-cols-4 border-t p-4 text-sm">
                  <span>Jane Doe</span>
                  <span>CBD → Kilimani</span>
                  <span>Today, 5:00 PM</span>
                  <span className="font-medium">Confirmed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}

export default ProviderDashboard;
