// src/app/utlaan/[id]/page.tsx
import LocationDetailClient from "./LocationDetailClient";

// Use type assertion to bypass strict typing
export default async function Page(props: any) {
  const { params } = props;
  const resolvedParams = await params; // Still treat params as a Promise
  return <LocationDetailClient id={resolvedParams.id} />;
}