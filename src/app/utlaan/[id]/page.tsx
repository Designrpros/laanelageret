// src/app/utlaan/[id]/page.tsx
import LocationDetailClient from "./LocationDetailClient";

// Define static params for export
export function generateStaticParams() {
  const locations = [{ id: "1" }]; // Stabekk - add more IDs if needed
  return locations.map((location) => ({
    id: location.id,
  }));
}

// Synchronous Server Component
export default function Page({ params }: { params: { id: string } }) {
  return <LocationDetailClient id={params.id} />;
}