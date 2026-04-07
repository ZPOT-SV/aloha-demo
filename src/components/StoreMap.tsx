import { useEffect, useMemo, useRef } from "react";

import { useStore } from "@nanostores/react";

import storesData from "../data/stores.json";
import { selectedStore, setSelectedStore } from "../stores";
import type { StoreLocation } from "../types";

const stores = storesData as StoreLocation[];

export default function StoreMap() {
  const activeStore = useStore(selectedStore);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  const fallbackStore = useMemo(() => {
    return activeStore ?? stores[0];
  }, [activeStore]);

  useEffect(() => {
    if (!fallbackStore || typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    void (async () => {
      const leafletModule = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted) {
        return;
      }

      const L = leafletModule.default;
      const alohaPin = L.divIcon({
        className: "aloha-map-pin",
        html: '<div style="display:grid;place-items:center;width:36px;height:36px;border-radius:9999px;background:#4EC5D4;color:#ffffff;font-weight:800;box-shadow:0 10px 25px rgba(78,197,212,0.35)">A</div>',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const map = L.map("aloha-store-map", {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([fallbackStore.lat, fallbackStore.lng], 13);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      stores.forEach((store) => {
        const marker = L.marker([store.lat, store.lng], {
          icon: alohaPin,
        }).addTo(map);

        marker.bindPopup(
          `<strong>${store.name}</strong><br />${store.address}<br /><span>${store.phone}</span>`,
        );

        marker.on("click", () => {
          setSelectedStore(store);
        });
      });
    })();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [fallbackStore]);

  useEffect(() => {
    if (!activeStore || !mapRef.current) {
      return;
    }

    mapRef.current.setView([activeStore.lat, activeStore.lng], 14);
  }, [activeStore]);

  return (
    <section className="rounded-[2rem] border border-brand/10 bg-white/90 p-4 shadow-2xl shadow-brand/10">
      <div id="aloha-store-map" className="h-[540px] rounded-[1.5rem]" />
    </section>
  );
}
