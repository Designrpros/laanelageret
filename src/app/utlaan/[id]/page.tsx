"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined"; // Outlined map icon
import MapIcon from "@mui/icons-material/Map"; // Filled map icon
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined"; // Outlined cart icon
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"; // Filled cart icon

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
  location: string;
}

interface CartItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
}

const LocationDetail = ({ params }: any) => {
  const locationId = parseInt(params.id, 10);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMapHovered, setIsMapHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isBorrowHovered, setIsBorrowHovered] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "items"),
      (snapshot) => {
        const fetchedItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          category: doc.data().category,
          subcategory: doc.data().subcategory,
          imageUrl: doc.data().imageUrl,
          rented: doc.data().rented || 0,
          inStock: doc.data().inStock || 0,
          description: doc.data().description || "Ingen beskrivelse tilgjengelig.",
          gallery: doc.data().gallery || [doc.data().imageUrl],
          location: doc.data().location || "Unknown",
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
    { id: 1, name: "Stabekk", lat: 59.90921845652782, lng: 10.611649286507243 },
  ];

  const selectedLocation = locations.find((loc) => loc.id === locationId);
  const mapUrl = selectedLocation
    ? `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=13`
    : "https://www.google.com/maps";

  const categories = ["All", ...new Set(items.map((item) => item.category))];
  const filteredItems = items
    .filter((item) => item.location === selectedLocation?.name)
    .filter((item) => selectedCategory === "All" || item.category === selectedCategory);

  const addToCart = (item: Item) => {
    if (item.inStock <= item.rented) {
      alert(`${item.name} is out of stock!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, imageUrl: item.imageUrl, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCheckout = () => {
    alert("Checkout functionality to be implemented!");
    setCart([]);
    setIsCartOpen(false);
  };

  const toggleFlip = (itemId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handleMapClick = () => {
    window.open(mapUrl, "_blank");
  };

  if (!selectedLocation) {
    return <div>Location not found</div>;
  }

  return (
    <Container>
      <LeftPanel>
        <Toolbar>
          <MapIconWrapper
            onClick={handleMapClick}
            onMouseEnter={() => setIsMapHovered(true)}
            onMouseLeave={() => setIsMapHovered(false)}
          >
            {isMapHovered ? <MapIcon /> : <MapOutlinedIcon />}
          </MapIconWrapper>
          <CartIconWrapper
            onClick={() => setIsCartOpen(!isCartOpen)}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
            {isCartHovered ? <ShoppingCartIcon /> : <ShoppingCartOutlinedIcon />}
          </CartIconWrapper>
          {cart.length > 0 && <CartCount>({cart.length})</CartCount>}
        </Toolbar>
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
                          {item.category}{item.subcategory ? ` - ${item.subcategory}` : ""}
                        </ItemCategory>
                      </ItemContent>
                      <StockBadge>
                        {item.rented}/{item.inStock}
                      </StockBadge>
                      <BorrowIconWrapper
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        onMouseEnter={() => setIsBorrowHovered(item.id)}
                        onMouseLeave={() => setIsBorrowHovered(null)}
                      >
                        {isBorrowHovered === item.id ? (
                          <ShoppingCartIcon />
                        ) : (
                          <ShoppingCartOutlinedIcon />
                        )}
                      </BorrowIconWrapper>
                    </CardFront>
                    <CardBack>
                      <BackContent>
                        <ItemName>{item.name}</ItemName>
                        <ItemCategory>
                          {item.category}{item.subcategory ? ` - ${item.subcategory}` : ""}
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
              <p>Ingen varer tilgjengelig på dette stedet eller i denne kategorien.</p>
            )}
          </ItemGrid>
        )}
      </LeftPanel>
      {isCartOpen && (
        <CartModal
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
        >
          <CartTitle>Your Cart</CartTitle>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <CartItem key={item.id}>
                  <CartItemImage src={item.imageUrl} alt={item.name} />
                  <CartItemDetails>
                    <CartItemName>{item.name}</CartItemName>
                    <CartItemQuantity>Quantity: {item.quantity}</CartItemQuantity>
                  </CartItemDetails>
                  <RemoveButton onClick={() => removeFromCart(item.id)}>Remove</RemoveButton>
                </CartItem>
              ))}
              <CheckoutButton onClick={handleCheckout}>Checkout</CheckoutButton>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </CartModal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  font-family: "Helvetica", Arial, sans-serif;
  background: #fff;
  position: relative;
`;

const LeftPanel = styled.div`
  flex: 1;
  padding: 3rem;
  overflow-y: auto;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
`;

const MapIconWrapper = styled.div`
  font-size: 1.5rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CartIconWrapper = styled.div`
  font-size: 1.5rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CartCount = styled.span`
  font-size: 1rem;
  color: #1a1a1a;
`;

const Title = styled(motion.h1)`
  font-size: clamp(2rem, 5vw, 2.5rem);
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
  background: ${({ isActive }) => (isActive ? "#000" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#1a1a1a")};
  border: 2px solid #1a1a1a;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #1a1a1a;
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 300px;
  position: relative;
  perspective: 1000px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
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
  border-radius: 12px;
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
  background: #1a1a1a;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BorrowIconWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.5rem;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.3s ease;
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

const CartModal = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  z-index: 1000;
`;

const CartTitle = styled.h2`
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
`;

const CartItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const CartItemDetails = styled.div`
  flex-grow: 1;
`;

const CartItemName = styled.p`
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
`;

const CartItemQuantity = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #cc3333;
  }
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background 0.3s ease;

  &:hover {
    background: #333;
  }
`;

export default LocationDetail;