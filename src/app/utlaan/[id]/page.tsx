// src/app/utlaan/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { FaShoppingCart } from "react-icons/fa";

// Define the props type for a dynamic route in a Client Component
interface LocationDetailProps {
  params: {
    id: string;
  };
}

const LocationDetail = ({ params }: LocationDetailProps) => {
  interface Item {
    id: string;
    name: string;
    category: string;
    subcategory?: string;
    imageUrl: string;
    rented: number;
    inStock: number;
    description?: string;
    gallery?: string[];
  }

  const locationId = parseInt(params.id, 10);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          rented: doc.data().rented || 0,
          inStock: doc.data().inStock || 0,
          description: doc.data().description || "Ingen beskrivelse tilgjengelig.",
          gallery: doc.data().gallery || [doc.data().imageUrl],
        })) as Item[];
        setItems(fetchedItems);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching items:", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const locations = [
    { id: 4, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
    { id: 1, name: "Oslo", lat: 59.9139, lng: 10.7522 },
    { id: 2, name: "Bergen", lat: 60.3913, lng: 5.3221 },
  ];

  const selectedLocation = locations.find((loc) => loc.id === locationId);
  const mapCenter = {
    lat: selectedLocation?.lat || 59.90921845652782,
    lng: selectedLocation?.lng || 10.611649286507243,
  };

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleBorrow = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (selectedLocation && item) {
      alert(`Borrowing ${item.name} from ${selectedLocation.name}!`);
    }
  };

  const toggleFlip = (itemId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  if (!selectedLocation) {
    return <div>Location not found</div>;
  }

  return (
    <Container>
      <LeftPanel>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {selectedLocation.name}
        </Title>
        <FilterContainer>
          {categories.map((category) => (
            <FilterButton
              key={category}
              isActive={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </FilterButton>
          ))}
        </FilterContainer>
        {isLoading ? (
          <p>Laster...</p>
        ) : (
          <ItemGrid>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <StoreItemCard
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <CardInner
                    animate={{ rotateY: flippedCards.has(item.id) ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CardFront>
                      <ItemImage src={item.imageUrl} alt={item.name} />
                      <ItemContent>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>
                          {item.category}
                          {item.subcategory ? ` - ${item.subcategory}` : ""}
                        </ItemCategory>
                      </ItemContent>
                      <StockBadge>
                        {item.rented}/{item.inStock}
                      </StockBadge>
                      <BorrowIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBorrow(item.id);
                        }}
                      />
                    </CardFront>
                    <CardBack>
                      <BackContent>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>
                          {item.category}
                          {item.subcategory ? ` - ${item.subcategory}` : ""}
                        </ItemCategory>
                        <Description>{item.description}</Description>
                        <Gallery>
                          {item.gallery?.map((url, idx) => (
                            <GalleryImage
                              key={idx}
                              src={url}
                              alt={`${item.name} ${idx}`}
                            />
                          ))}
                        </Gallery>
                      </BackContent>
                    </CardBack>
                  </CardInner>
                </StoreItemCard>
              ))
            ) : (
              <p>Ingen varer tilgjengelig i denne kategorien.</p>
            )}
          </ItemGrid>
        )}
      </LeftPanel>
      <RightPanel>
        <MapWrapper>
          <LocationMap center={mapCenter} />
        </MapWrapper>
      </RightPanel>
    </Container>
  );
};

// Styled components
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  font-family: "Helvetica", Arial, sans-serif;
  background: #ffffff;
`;

const LeftPanel = styled.div`
  flex: 2;
  padding: 3rem;
  overflow-y: auto;
`;

const RightPanel = styled.div`
  flex: 1;
  height: 100%;
  background: #f9f9f9;
`;

const MapWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Title = styled(motion.h1)`
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 2rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2.5rem;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  font-size: 16px;
  background: ${({ isActive }) => (isActive ? "#d4af37" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#333")};
  border: 1px solid #d4af37;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #d4af37;
    color: #fff;
    transform: translateY(-2px);
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const StoreItemCard = styled(motion.div)`
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 300px;
  position: relative;
  perspective: 1000px;
  cursor: pointer;
`;

const CardInner = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
`;

const CardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
`;

const CardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  overflow-y: auto;
`;

const ItemImage = styled.img`
  width: 100%;
  height: 60%;
  object-fit: cover;
`;

const ItemContent = styled.div`
  padding: 1rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ItemName = styled.h3`
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const ItemCategory = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StockBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #d4af37;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BorrowIcon = styled(FaShoppingCart)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #d4af37;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #b8860b;
  }
`;

const BackContent = styled.div`
  text-align: left;
  color: #333;
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 0.5rem 0;
  max-height: 80px;
  overflow-y: auto;
`;

const Gallery = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-top: 0.5rem;
`;

const GalleryImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
`;

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

const LocationMap = ({ center }: { center: google.maps.LatLngLiteral }) => {
  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationDetail;