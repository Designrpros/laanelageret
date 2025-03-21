"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';

// Styled Components
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
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 2rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
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
  max-width: 500px;  // Increased the max-width for bigger cards
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    max-width: 90%; // Make it more flexible for smaller screens
  
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 12px 12px 0 0;
`;

const LocationTitle = styled(motion.div)`
  font-size: 1.5rem;
  font-weight: bold;
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 12px;
  border-radius: 5px;
  color: white;
  z-index: 1;
  transition: opacity 0.3s ease-in-out;

  ${LocationCard}:hover & {
    opacity: 0;
  }
`;

// Locations data
const locations = [
  { id: 4, name: 'Rap Clinic Smia Stabekk', lat: 59.90921845652782, lng: 10.611649286507243 },
];

type LocationType = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

// Google Maps API Key
const googleMapsApiKey = 'AIzaSyAeaLX1WrWu5H5CtGmSmX718T4AaadotbA';

// Reusable Map Component
const LocationMap = ({ center }: { center: google.maps.LatLngLiteral }) => {
  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={13}
        options={{ disableDefaultUI: true, gestureHandling: 'none' }} // Disable controls and panning
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