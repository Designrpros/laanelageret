// src/app/utlaan/[id]/page.tsx
import LocationDetailClient from "./LocationDetailClient";

export function generateStaticParams() {
  const locations = [{ id: "1" }]; // Stabekk - add more IDs if needed
  return locations.map((location) => ({
    id: location.id,
  }));
}

// Explicitly handle params as a Promise for TypeScript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <LocationDetailClient id={resolvedParams.id} />;
}