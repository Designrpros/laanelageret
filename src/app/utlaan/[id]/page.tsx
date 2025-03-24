// src/app/utlaan/[id]/page.tsx
import { NextPage } from "next";
import LocationDetailClient from "./LocationDetailClient";

// Use NextPage with explicit params as Promise
const Page: NextPage<{
  params: Promise<{ id: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}> = async ({ params }) => {
  const resolvedParams = await params; // Resolve the Promise
  return <LocationDetailClient id={resolvedParams.id} />;
};

export default Page;