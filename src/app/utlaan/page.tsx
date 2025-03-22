"use client";

import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";

// Styled Components - background: #fff;
const Section = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  font-family: "Helvetica", Arial, sans-serif;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 3rem;
  text-align: center;
  color: #1a1a1a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
`;

const LocationCard = styled(motion.div)`
  position: relative;
  max-width: 500px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    max-width: 90%;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
`;

const LocationTitle = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: 600;
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 8px;
  color: #fff;
  z-index: 1;
  transition: opacity 0.3s ease-in-out;

  ${LocationCard}:hover & {
    opacity: 0.8;
  }
`;

// Locations data
const locations = [
  { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
];

type LocationType = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

// Google Maps API Key
const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

// Reusable Map Component
const LocationMap = ({ center }: { center: google.maps.LatLngLiteral }) => {
  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
        options={{ disableDefaultUI: true, gestureHandling: "none" }}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default function Utlån() {
  const router = useRouter();

  const handleCardClick = (id: number) => {
    router.push(`/utlaan/${id}`);
  };

  return (
    <Section>
      <Title
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Utlån Lokasjoner
      </Title>
      <Grid>
        {locations.map((location, index) => (
          <LocationCard
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            onClick={() => handleCardClick(location.id)}
          >
            <MapContainer>
              <LocationMap center={{ lat: location.lat, lng: location.lng }} />
            </MapContainer>
            <LocationTitle>{location.name}</LocationTitle>
          </LocationCard>
        ))}
      </Grid>
    </Section>
  );
}