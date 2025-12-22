"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

function MapEvents({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);
  const initialPos: [number, number] = [lat || 55.7558, lng || 37.6173]; // Moscow default

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[200px] w-full bg-zinc-800 animate-pulse rounded-lg" />;

  return (
    <div className="space-y-2">
      <div className="h-[200px] w-full rounded-lg overflow-hidden border border-zinc-800">
        <MapContainer
          center={initialPos}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onChange={onChange} />
          {lat && lng && (
            <Marker position={[lat, lng]} icon={defaultIcon} />
          )}
        </MapContainer>
      </div>
      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-center">
        Нажмите на карту, чтобы выбрать местоположение
      </p>
    </div>
  );
}
