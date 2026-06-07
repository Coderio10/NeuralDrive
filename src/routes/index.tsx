import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sidebar, type Filter } from "@/components/charge/Sidebar";
import { MapView } from "@/components/charge/MapView";
import { TopBar, type Country, type ViewMode } from "@/components/charge/TopBar";

import { AuthModal } from "@/components/charge/AuthModal";
import { stations as ALL } from "@/data/stations";
import { StationCard } from "@/components/charge/StationCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Neural Drive — Find EV Chargers in Nigeria" },
      { name: "description", content: "Live map of EV charging stations across Lagos, Abuja, Port Harcourt and Ibadan." },
      { property: "og:title", content: "Neural Drive — Find EV Chargers in Nigeria" },
      { property: "og:description", content: "Live map of EV charging stations across Nigeria." },
    ],
  }),
  component: Index,
});

function Index() {
  const [country, setCountry] = useState<Country>("Nigeria");

  const [view, setView] = useState<ViewMode>("map");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const filtered = useMemo(() => {
    // Currently all sample stations are in Nigeria, so country selection just controls map centering.
    return ALL
      .filter((s) => {
        if (filter === "available") return s.status === "available";
        if (filter === "fast") return s.powerKw >= 50;
        if (filter === "24/7") return s.open24;
        if (filter === "free") return s.free;
        return true;
      })

      .filter((s) =>
        query.trim() === ""
          ? true
          : (s.name + " " + s.address + " " + s.operator).toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filter, query]);


  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col gap-3 sm:h-[calc(100vh-2rem)] sm:gap-4">
        <TopBar country={country} onCountryChange={setCountry} view={view} onViewChange={setView} onSignIn={() => setAuthOpen(true)} />


        <div className="flex min-h-0 flex-1 gap-4">
          <Sidebar
            stations={filtered}
            activeId={activeId}
            onSelect={setActiveId}
            onHover={setActiveId}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
          />

          <main className="min-w-0 flex-1">
            {view === "map" ? (
              <MapView
                stations={filtered}
                city={"Lagos"}
                country={country}
                activeId={activeId}


                onSelect={setActiveId}
                onHover={setActiveId}
              />
            ) : (
              <div className="h-full overflow-y-auto rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">

                <h2 className="mb-4 text-lg font-semibold">Chargers in {country}</h2>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((s) => (
                    <StationCard key={s.id} station={s} active={s.id === activeId} onSelect={setActiveId} onHover={setActiveId} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
