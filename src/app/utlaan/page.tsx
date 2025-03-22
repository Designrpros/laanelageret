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
  padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem); /* Responsive padding */
  font-family: "Helvetica", Arial, sans-serif;
`;

const Title = styled(motion.h1)`
  font-size: clamp(1.5rem, 4vw, 3.5rem); /* Smaller on mobile, larger on desktop */
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: clamp(1.5rem, 3vw, 3rem);
  text-align: center;
  color: #1a1a1a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column; /* Stack vertically on mobile */
  gap: clamp(1rem, 2vw, 2rem); /* Responsive gap */
  align-items: center;
  width: 100%;
  max-width: 1200px;

  @media (min-width: 768px) {
    flex-direction: row; /* Row layout on desktop */
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const LocationCard = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 500px; /* Max width on desktop */
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

  @media (max-width: 767px) {
    max-width: 100%; /* Full width on mobile */
    margin: 0 0.5rem; /* Small horizontal margin */
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: clamp(150px, 30vw, 200px); /* Smaller height on mobile */
  border-radius: 12px 12px 0 0;
`;

const LocationTitle = styled(motion.div)`
  font-size: clamp(1rem, 2.5vw, 1.5rem); /* Responsive font size */
  font-weight: 600;
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  padding: clamp(6px, 1vw, 8px) clamp(10px, 2vw, 16px);
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