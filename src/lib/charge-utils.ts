import type { Station } from "@/data/stations";

export function directionsUrl(s: Pick<Station, "lat" | "lng" | "name">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=${encodeURIComponent(s.name)}`;
}

export function openDirections(s: Pick<Station, "lat" | "lng" | "name">) {
  if (typeof window !== "undefined") {
    window.open(directionsUrl(s), "_blank", "noopener,noreferrer");
  }
}